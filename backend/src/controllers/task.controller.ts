import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, priority, assignedTo, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (priority) where.priority = priority.toUpperCase();
    if (assignedTo) where.assignedTo = { contains: assignedTo, mode: 'insensitive' };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, skip, take: parseInt(limit), orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }] }),
      prisma.task.count({ where }),
    ]);

    const now = new Date();
    const annotated = tasks.map(t => ({ ...t, isOverdue: t.dueDate ? t.dueDate < now && t.status !== 'COMPLETED' : false }));

    res.json({ tasks: annotated, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findFirst({ where: { OR: [{ id }, { taskId: id }] } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    const taskId = `TSK-${Date.now().toString(36).toUpperCase()}`;

    const task = await prisma.task.create({
      data: {
        taskId,
        title,
        description,
        priority: priority?.toUpperCase() ?? 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedTo,
        status: 'PENDING',
        userId: req.user?.id,
      },
    });

    await prisma.systemEvent.create({
      data: {
        eventType: 'TASK_CREATED',
        entityType: 'TASK',
        entityId: task.id,
        userId: req.user?.id,
        description: `Task "${title}" created`,
      },
    });

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.task.findFirst({ where: { OR: [{ id }, { taskId: id }] } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const { title, description, priority, dueDate, assignedTo, status } = req.body;
    const completedAt = status === 'COMPLETED' && existing.status !== 'COMPLETED' ? new Date() : undefined;

    const task = await prisma.task.update({
      where: { id: existing.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority: priority.toUpperCase() }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(status !== undefined && { status: status.toUpperCase() }),
        ...(completedAt && { completedAt }),
      },
    });

    if (status === 'COMPLETED') {
      const io = req.app.get('io');
      io?.emit('task:completed', { taskId: task.taskId });
    }

    res.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.task.findFirst({ where: { OR: [{ id }, { taskId: id }] } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.update({ where: { id: existing.id }, data: { status: 'CANCELLED' } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskStatistics = async (_req: AuthRequest, res: Response) => {
  try {
    const [byStatus, byPriority, overdueTasks] = await Promise.all([
      prisma.task.groupBy({ by: ['status'], _count: true }),
      prisma.task.groupBy({ by: ['priority'], _count: true }),
      prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
    ]);
    res.json({ byStatus, byPriority, overdueTasks, total: await prisma.task.count() });
  } catch (error) {
    console.error('Task statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
