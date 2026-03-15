import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { status, customerId, invoiceType, search, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (customerId) where.customerId = customerId;
    if (invoiceType) where.invoiceType = invoiceType.toUpperCase();
    if (search) {
      where.OR = [
        { invoiceId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, customerId: true, name: true } } },
      }),
      prisma.invoice.count({ where }),
    ]);

    // Summary totals
    const summary = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: { in: ['SENT', 'OVERDUE', 'DISPUTED'] } },
    });

    res.json({ invoices, total, page: parseInt(page), limit: parseInt(limit), outstanding: summary._sum?.total ?? 0 });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findFirst({
      where: { OR: [{ id }, { invoiceId: id }] },
      include: {
        customer: true,
        order: { select: { id: true, orderId: true, poNumber: true } },
      },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, orderId, invoiceType, amount, taxRate = 0.15, description, dueDate } = req.body;

    const customer = await prisma.customer.findFirst({ where: { OR: [{ id: customerId }, { customerId }] } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const amt = parseFloat(amount);
    const tax = Math.round(amt * parseFloat(taxRate) * 100) / 100;
    const total = Math.round((amt + tax) * 100) / 100;

    const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceId,
        customerId: customer.id,
        orderId: orderId ?? undefined,
        invoiceType: invoiceType?.toUpperCase() ?? 'SALES',
        taxAmount: tax,
        total,
        description,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'DRAFT',
      },
      include: { customer: { select: { id: true, customerId: true, name: true } } },
    });

    res.status(201).json({ invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.invoice.findFirst({ where: { OR: [{ id }, { invoiceId: id }] } });
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });

    const { status, description, dueDate } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id: existing.id },
      data: {
        ...(status !== undefined && { status: status.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(status === 'PAID' && !existing.paidAt && { paidAt: new Date() }),
      },
    });

    const io = req.app.get('io');
    if (status === 'PAID') io?.emit('invoice:paid', { invoiceId: invoice.invoiceId, total: invoice.total });

    res.json({ invoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.invoice.findFirst({ where: { OR: [{ id }, { invoiceId: id }] } });
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });
    if (!['DRAFT', 'CANCELLED'].includes(existing.status)) {
      return res.status(400).json({ error: 'Only draft invoices can be deleted' });
    }

    await prisma.invoice.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvoiceStatistics = async (_req: AuthRequest, res: Response) => {
  try {
    const [byStatus, revenue] = await Promise.all([
      prisma.invoice.groupBy({ by: ['status'], _count: true, _sum: { total: true } }),
      prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
    ]);
    res.json({ byStatus, totalRevenue: revenue._sum.total ?? 0, total: await prisma.invoice.count() });
  } catch (error) {
    console.error('Invoice statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
