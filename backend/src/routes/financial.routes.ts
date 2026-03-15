import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getFinancialSummary, getMonthlyFinancials, getCostCenters, updateCostCenter, getDataCenters } from '../controllers/financial.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/summary', getFinancialSummary);
router.get('/monthly', getMonthlyFinancials);
router.get('/data-centers', getDataCenters);

router.get('/cost-centers', [
  query('status').optional().trim(),
  query('department').optional().trim(),
], validate, getCostCenters);

router.put('/cost-centers/:id', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), [
  param('id').notEmpty(),
  body('budget').optional().isFloat({ min: 0 }),
  body('spent').optional().isFloat({ min: 0 }),
  body('committed').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['ON_TRACK', 'OVER_BUDGET', 'UNDER_REVIEW', 'CLOSED']),
], validate, updateCostCenter);

export default router;
