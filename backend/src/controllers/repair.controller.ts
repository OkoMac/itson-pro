import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getRepairs = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, customerId, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { repairId: { contains: search, mode: 'insensitive' } },
        { deviceType: { contains: search, mode: 'insensitive' } },
        { issue: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [repairs, total] = await Promise.all([
      prisma.repair.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, customerId: true, name: true } } },
      }),
      prisma.repair.count({ where }),
    ]);

    res.json({ repairs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get repairs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRepairById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const repair = await prisma.repair.findFirst({
      where: { OR: [{ id }, { repairId: id }] },
      include: { customer: true },
    });
    if (!repair) return res.status(404).json({ error: 'Repair not found' });
    res.json({ repair });
  } catch (error) {
    console.error('Get repair by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRepair = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, deviceType, serialNumber, issue, estimatedCost, estimatedCompletion, notes } = req.body;

    // Validate customer exists
    const customer = await prisma.customer.findFirst({ where: { OR: [{ id: customerId }, { customerId }] } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const repairId = `RPR-${Date.now().toString(36).toUpperCase()}`;

    const repair = await prisma.repair.create({
      data: {
        repairId,
        customerId: customer.id,
        deviceType,
        serialNumber,
        issue,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : undefined,
        notes,
        status: 'RECEIVED',
        userId: req.user?.id,
      },
      include: { customer: { select: { id: true, customerId: true, name: true } } },
    });

    res.status(201).json({ repair });
  } catch (error) {
    console.error('Create repair error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRepair = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.repair.findFirst({ where: { OR: [{ id }, { repairId: id }] } });
    if (!existing) return res.status(404).json({ error: 'Repair not found' });

    const { status, estimatedCost, actualCost, estimatedCompletion, notes } = req.body;
    const completedAt = status === 'COMPLETED' && existing.status !== 'COMPLETED' ? new Date() : undefined;

    const repair = await prisma.repair.update({
      where: { id: existing.id },
      data: {
        ...(status !== undefined && { status: status.toUpperCase() }),
        ...(estimatedCost !== undefined && { estimatedCost: parseFloat(estimatedCost) }),
        ...(actualCost !== undefined && { actualCost: parseFloat(actualCost) }),
        ...(estimatedCompletion !== undefined && { estimatedCompletion: new Date(estimatedCompletion) }),
        ...(notes !== undefined && { notes }),
        ...(completedAt && { completedAt }),
      },
      include: { customer: { select: { id: true, customerId: true, name: true } } },
    });

    const io = req.app.get('io');
    if (status) io?.emit('repair:status_changed', { repairId: repair.repairId, status: repair.status });

    res.json({ repair });
  } catch (error) {
    console.error('Update repair error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRepair = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.repair.findFirst({ where: { OR: [{ id }, { repairId: id }] } });
    if (!existing) return res.status(404).json({ error: 'Repair not found' });

    await prisma.repair.update({ where: { id: existing.id }, data: { status: 'CANCELLED' } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete repair error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRepairStatistics = async (_req: AuthRequest, res: Response) => {
  try {
    const [byStatus, avgCost] = await Promise.all([
      prisma.repair.groupBy({ by: ['status'], _count: true }),
      prisma.repair.aggregate({ _avg: { estimatedCost: true, actualCost: true } }),
    ]);
    res.json({ byStatus, avgCost: avgCost._avg, total: await prisma.repair.count() });
  } catch (error) {
    console.error('Repair statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
