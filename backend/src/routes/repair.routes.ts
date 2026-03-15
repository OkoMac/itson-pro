import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getRepairs, getRepairById, createRepair, updateRepair, deleteRepair, getRepairStatistics } from '../controllers/repair.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/', [
  query('status').optional().isIn(['RECEIVED', 'DIAGNOSIS', 'WAITING_PARTS', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'COLLECTED', 'CANCELLED']),
  query('customerId').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
], validate, getRepairs);

router.get('/statistics', getRepairStatistics);
router.get('/:id', [param('id').notEmpty()], validate, getRepairById);

router.post('/', [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('deviceType').notEmpty().withMessage('Device type is required'),
  body('issue').notEmpty().withMessage('Issue description is required'),
  body('estimatedCost').optional().isFloat({ min: 0 }),
  body('estimatedCompletion').optional().isISO8601(),
], validate, createRepair);

router.put('/:id', [
  param('id').notEmpty(),
  body('status').optional().isIn(['RECEIVED', 'DIAGNOSIS', 'WAITING_PARTS', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'COLLECTED', 'CANCELLED']),
  body('actualCost').optional().isFloat({ min: 0 }),
], validate, updateRepair);

router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteRepair);

export default router;
