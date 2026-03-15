import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, getTaskStatistics } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'BLOCKED']),
  query('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']),
  query('search').optional().trim(),
], validate, getTasks);

router.get('/statistics', getTaskStatistics);
router.get('/:id', [param('id').notEmpty()], validate, getTaskById);

router.post('/', [
  body('title').notEmpty().trim(),
  body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']),
  body('dueDate').optional().isISO8601(),
  body('assignedTo').optional().trim(),
], validate, createTask);

router.put('/:id', [
  param('id').notEmpty(),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'BLOCKED']),
  body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']),
], validate, updateTask);

router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), deleteTask);

export default router;
