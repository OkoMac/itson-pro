import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getDashboardSummary = async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      activeOrders,
      ordersAtRisk,
      pendingApprovals,
      openTasks,
      urgentTasks,
      lowStockProducts,
      recentRepairs,
      revenueThisMonth,
      overdueInvoices,
    ] = await Promise.all([
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } } }),
      prisma.order.count({ where: { riskStatus: { in: ['HIGH', 'CRITICAL'] } } }),
      prisma.approval.count({ where: { status: 'PENDING' } }),
      prisma.task.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.task.count({ where: { priority: 'HIGH', status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      prisma.product.count({ where: { status: 'ACTIVE', stockOnHand: { lte: 0 } } }),
      prisma.repair.count({ where: { status: { in: ['RECEIVED', 'DIAGNOSIS', 'IN_PROGRESS'] } } }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: 'PAID', paidAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
      }),
      prisma.invoice.count({ where: { status: 'OVERDUE' } }),
    ]);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { customer: { select: { name: true, customerId: true } } },
    });

    // Recent events
    const recentEvents = await prisma.systemEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, eventType: true, entityType: true, entityId: true, description: true, createdAt: true },
    });

    // Orders by stage
    const ordersByStage = await prisma.order.groupBy({
      by: ['currentStage'],
      _count: true,
      where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } },
    });

    res.json({
      kpis: {
        totalCustomers,
        activeOrders,
        ordersAtRisk,
        pendingApprovals,
        openTasks,
        urgentTasks,
        lowStockProducts,
        recentRepairs,
        revenueThisMonth: revenueThisMonth._sum?.total ?? 0,
        overdueInvoices,
      },
      recentOrders,
      recentEvents,
      ordersByStage,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSystemEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, eventType, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (entityType) where.entityType = entityType.toUpperCase();
    if (eventType) where.eventType = { contains: eventType, mode: 'insensitive' };

    const [events, total] = await Promise.all([
      prisma.systemEvent.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.systemEvent.count({ where }),
    ]);

    res.json({ events, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get system events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
