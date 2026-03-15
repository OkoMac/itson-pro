import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const { status, entityType, requestedBy, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (entityType) where.entityType = entityType.toUpperCase();
    if (requestedBy) where.requestedBy = { contains: requestedBy, mode: 'insensitive' };

    const [approvals, total] = await Promise.all([
      prisma.approval.findMany({ where, skip, take: parseInt(limit), orderBy: { requestedAt: 'desc' } }),
      prisma.approval.count({ where }),
    ]);

    res.json({ approvals, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getApprovalById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const approval = await prisma.approval.findFirst({ where: { OR: [{ id }, { approvalId: id }] } });
    if (!approval) return res.status(404).json({ error: 'Approval not found' });
    res.json({ approval });
  } catch (error) {
    console.error('Get approval by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId, requestedBy, comments } = req.body;
    const approvalId = `APV-${Date.now().toString(36).toUpperCase()}`;

    const approval = await prisma.approval.create({
      data: {
        approvalId,
        entityType: entityType.toUpperCase(),
        entityId,
        requestedBy: requestedBy ?? req.user?.email ?? 'Unknown',
        comments,
        status: 'PENDING',
        userId: req.user?.id,
      },
    });

    const io = req.app.get('io');
    io?.emit('approval:requested', { approvalId: approval.approvalId, entityType, entityId });

    res.status(201).json({ approval });
  } catch (error) {
    console.error('Create approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const processApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body; // action: 'approve' | 'reject'

    const existing = await prisma.approval.findFirst({ where: { OR: [{ id }, { approvalId: id }] } });
    if (!existing) return res.status(404).json({ error: 'Approval not found' });
    if (existing.status !== 'PENDING') return res.status(400).json({ error: 'Approval already processed' });

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const approval = await prisma.approval.update({
      where: { id: existing.id },
      data: {
        status: newStatus,
        approvedBy: req.user?.email,
        approvedAt: new Date(),
        comments: comments ?? existing.comments,
      },
    });

    await prisma.systemEvent.create({
      data: {
        eventType: `APPROVAL_${newStatus}`,
        entityType: 'APPROVAL',
        entityId: approval.id,
        userId: req.user?.id,
        description: `Approval ${approval.approvalId} ${newStatus.toLowerCase()} by ${req.user?.email}`,
        metadata: { comments },
      },
    });

    const io = req.app.get('io');
    io?.emit(`approval:${action}d`, { approvalId: approval.approvalId, entityId: existing.entityId });

    res.json({ approval });
  } catch (error) {
    console.error('Process approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getApprovalStatistics = async (_req: AuthRequest, res: Response) => {
  try {
    const [byStatus, byEntityType, pendingCount] = await Promise.all([
      prisma.approval.groupBy({ by: ['status'], _count: true }),
      prisma.approval.groupBy({ by: ['entityType'], _count: true }),
      prisma.approval.count({ where: { status: 'PENDING' } }),
    ]);
    res.json({ byStatus, byEntityType, pendingCount });
  } catch (error) {
    console.error('Approval statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
