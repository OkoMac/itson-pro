import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice, getInvoiceStatistics } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/', [
  query('status').optional().isIn(['DRAFT', 'PENDING', 'APPROVED', 'SENT', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED']),
  query('invoiceType').optional().trim(),
  query('customerId').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
], validate, getInvoices);

router.get('/statistics', getInvoiceStatistics);
router.get('/:id', [param('id').notEmpty()], validate, getInvoiceById);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('invoiceType').optional().isIn(['SALES', 'REPAIR', 'MAINTENANCE', 'HOSTING', 'OTHER']),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601(),
], validate, createInvoice);

router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), [
  param('id').notEmpty(),
  body('status').optional().isIn(['DRAFT', 'PENDING', 'APPROVED', 'SENT', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED']),
], validate, updateInvoice);

router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteInvoice);

export default router;
