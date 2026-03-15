import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getFinancialSummary = async (_req: AuthRequest, res: Response) => {
  try {
    const summary = await prisma.financialSummary.findFirst({
      orderBy: { period: 'desc' },
    });

    if (!summary) {
      // Compute on the fly from invoices if no pre-computed summary exists
      const [paidRevenue, outstandingReceivable, costCenters] = await Promise.all([
        prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
        prisma.invoice.aggregate({ _sum: { total: true }, where: { status: { in: ['SENT', 'APPROVED', 'OVERDUE', 'DISPUTED'] } } }),
        prisma.costCenter.aggregate({ _sum: { budget: true, spent: true, committed: true } }),
      ]);

      return res.json({
        summary: {
          totalRevenue: paidRevenue._sum.total ?? 0,
          accountsReceivable: outstandingReceivable._sum.total ?? 0,
          accountsPayable: costCenters._sum.committed ?? 0,
          totalBudget: costCenters._sum.budget ?? 0,
          totalSpent: costCenters._sum.spent ?? 0,
          grossMargin: 0,
          netMargin: 0,
          cashPosition: 0,
        },
      });
    }

    res.json({ summary });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMonthlyFinancials = async (_req: AuthRequest, res: Response) => {
  try {
    const summaries = await prisma.financialSummary.findMany({
      orderBy: { period: 'asc' },
      take: 12,
    });

    res.json({ monthly: summaries });
  } catch (error) {
    console.error('Get monthly financials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCostCenters = async (req: AuthRequest, res: Response) => {
  try {
    const { status, department, page = '1', limit = '100' } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status.toUpperCase().replace(/-/g, '_');
    if (department) where.department = { contains: department, mode: 'insensitive' };

    const [costCenters, total] = await Promise.all([
      prisma.costCenter.findMany({ where, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit), orderBy: { department: 'asc' } }),
      prisma.costCenter.count({ where }),
    ]);

    // Annotate with utilisation
    const annotated = costCenters.map(cc => ({
      ...cc,
      utilisationPct: cc.budget > 0 ? Math.round(((cc.spent + cc.committed) / cc.budget) * 100) : 0,
      remaining: cc.budget - cc.spent - cc.committed,
    }));

    res.json({ costCenters: annotated, total });
  } catch (error) {
    console.error('Get cost centers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCostCenter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.costCenter.findFirst({ where: { OR: [{ id }, { costCenterId: id }] } });
    if (!existing) return res.status(404).json({ error: 'Cost centre not found' });

    const { budget, spent, committed, status, description } = req.body;

    const cc = await prisma.costCenter.update({
      where: { id: existing.id },
      data: {
        ...(budget !== undefined && { budget: parseFloat(budget) }),
        ...(spent !== undefined && { spent: parseFloat(spent) }),
        ...(committed !== undefined && { committed: parseFloat(committed) }),
        ...(status !== undefined && { status: status.toUpperCase().replace(/-/g, '_') }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({ costCenter: { ...cc, utilisationPct: Math.round(((cc.spent + cc.committed) / cc.budget) * 100) } });
  } catch (error) {
    console.error('Update cost center error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDataCenters = async (_req: AuthRequest, res: Response) => {
  try {
    const dcs = await prisma.dataCenter.findMany({ orderBy: { name: 'asc' } });

    const annotated = dcs.map(dc => {
      const powerCostMonthly = Math.round(dc.avgPowerKw * dc.powerCostPerKwh * 24 * 30);
      const total = dc.monthlyRackCost + powerCostMonthly + dc.bandwidthCostMonthly + dc.supportContractMonthly + dc.labourCostMonthly;
      return { ...dc, powerCostMonthly, totalMonthlyCost: total };
    });

    res.json({ dataCenters: annotated });
  } catch (error) {
    console.error('Get data centers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
