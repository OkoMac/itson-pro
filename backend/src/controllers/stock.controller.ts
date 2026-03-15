import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getStockMovements = async (req: AuthRequest, res: Response) => {
  try {
    const { sku, transactionType, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (sku) where.sku = sku;
    if (transactionType) where.transactionType = transactionType.toUpperCase();

    const [movements, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { sku: true, productName: true, stockOnHand: true } } },
      }),
      prisma.stockTransaction.count({ where }),
    ]);

    res.json({ movements, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('List stock movements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, transactionType, referenceId, notes } = req.body;

    const product = await prisma.product.findFirst({ where: { OR: [{ id: productId }, { sku: productId }] } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const qty = parseInt(quantity);
    const isInbound = ['PURCHASE', 'RETURN', 'TRANSFER'].includes((transactionType as string).toUpperCase());
    const newStock = isInbound ? product.stockOnHand + qty : product.stockOnHand - qty;

    if (newStock < 0) {
      return res.status(400).json({ error: 'Insufficient stock for this adjustment' });
    }

    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`;

    const [movement] = await prisma.$transaction([
      prisma.stockTransaction.create({
        data: {
          transactionId,
          sku: product.sku,
          transactionType: (transactionType as string).toUpperCase() as any,
          qty,
          referenceId,
          notes,
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { stockOnHand: newStock },
      }),
    ]);

    // Emit low-stock alert if below reorder level
    if (newStock <= product.reorderLevel) {
      const io = req.app.get('io');
      io?.emit('stock:low_threshold', { sku: product.sku, productName: product.productName, stockOnHand: newStock, reorderLevel: product.reorderLevel });
    }

    res.status(201).json({ movement, newStockOnHand: newStock });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLowStockProducts = async (_req: AuthRequest, res: Response) => {
  try {
    const all = await prisma.product.findMany({ where: { status: 'ACTIVE' } });
    const lowStock = all.filter(p => p.stockOnHand <= p.reorderLevel);
    res.json({ products: lowStock });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStockSummary = async (_req: AuthRequest, res: Response) => {
  try {
    const [totalMovements, byType] = await Promise.all([
      prisma.stockTransaction.count(),
      prisma.stockTransaction.groupBy({ by: ['transactionType'], _count: true, _sum: { qty: true } }),
    ]);

    const allProducts = await prisma.product.findMany({ where: { status: 'ACTIVE' } });
    const totalStockValue = allProducts.reduce((s, p) => s + p.stockOnHand * p.unitPrice, 0);
    const lowStockItems = allProducts.filter(p => p.stockOnHand <= p.reorderLevel).length;
    const outOfStockItems = allProducts.filter(p => p.stockOnHand === 0).length;

    res.json({ totalMovements, byType, totalStockValue, lowStockItems, outOfStockItems, totalProducts: allProducts.length });
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
