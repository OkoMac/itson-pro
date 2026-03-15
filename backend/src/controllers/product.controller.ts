import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, status, lowStock, page = '1', limit = '100' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (lowStock === 'true') where.stockOnHand = { lte: prisma.product.fields.reorderLevel };
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: parseInt(limit), orderBy: { productName: 'asc' } }),
      prisma.product.count({ where }),
    ]);

    // Annotate with low stock flag
    const annotated = products.map(p => ({
      ...p,
      isLowStock: p.stockOnHand <= p.reorderLevel,
    }));

    res.json({ products: annotated, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: { ...product, isLowStock: product.stockOnHand <= product.reorderLevel } });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { sku, category, productName, description, unitPrice, costPrice, stockOnHand, reorderLevel, leadTimeDays } = req.body;

    const product = await prisma.product.create({
      data: {
        sku,
        category,
        productName,
        description,
        unitPrice: parseFloat(unitPrice),
        costPrice: parseFloat(costPrice ?? unitPrice),
        stockOnHand: parseInt(stockOnHand ?? '0'),
        reorderLevel: parseInt(reorderLevel ?? '10'),
        leadTimeDays: parseInt(leadTimeDays ?? '7'),
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findFirst({ where: { OR: [{ id }, { sku: id }] } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { productName, category, description, unitPrice, costPrice, stockOnHand, reorderLevel, leadTimeDays, status } = req.body;

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...(productName !== undefined && { productName }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
        ...(stockOnHand !== undefined && { stockOnHand: parseInt(stockOnHand) }),
        ...(reorderLevel !== undefined && { reorderLevel: parseInt(reorderLevel) }),
        ...(leadTimeDays !== undefined && { leadTimeDays: parseInt(leadTimeDays) }),
        ...(status !== undefined && { status: status.toUpperCase() }),
      },
    });

    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findFirst({ where: { OR: [{ id }, { sku: id }] } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await prisma.product.update({ where: { id: existing.id }, data: { status: 'DISCONTINUED' } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductStatistics = async (_req: AuthRequest, res: Response) => {
  try {
    const [byCategory, byStatus, totalProducts] = await Promise.all([
      prisma.product.groupBy({ by: ['category'], _count: true, _sum: { stockOnHand: true } }),
      prisma.product.groupBy({ by: ['status'], _count: true }),
      prisma.product.count(),
    ]);

    const all = await prisma.product.findMany({ where: { status: 'ACTIVE' } });
    const lowStockCount = all.filter(p => p.stockOnHand <= p.reorderLevel).length;
    const totalStockValue = all.reduce((s, p) => s + p.stockOnHand * p.unitPrice, 0);

    res.json({ byCategory, byStatus, totalProducts, lowStockCount, totalStockValue });
  } catch (error) {
    console.error('Product statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
