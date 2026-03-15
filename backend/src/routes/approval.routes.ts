import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getApprovals, getApprovalById, createApproval, processApproval, getApprovalStatistics } from '../controllers/approval.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/', [
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
  query('entityType').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
], validate, getApprovals);

router.get('/statistics', getApprovalStatistics);
router.get('/:id', [param('id').notEmpty()], validate, getApprovalById);

router.post('/', [
  body('entityType').notEmpty().isIn(['ORDER', 'INVOICE', 'EXPENSE', 'PURCHASE', 'LEAVE']),
  body('entityId').notEmpty().trim(),
  body('requestedBy').optional().trim(),
], validate, createApproval);

router.patch('/:id/process', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), [
  param('id').notEmpty(),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('comments').optional().trim(),
], validate, processApproval);

export default router;
