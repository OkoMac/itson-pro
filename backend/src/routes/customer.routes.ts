import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStatistics,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const createCustomerValidation = [
  body('customerId').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('segment').notEmpty().trim(),
  body('location').notEmpty().trim(),
  body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PROSPECT', 'ARCHIVED']),
  body('contactEmail').optional().isEmail(),
];

const updateCustomerValidation = [
  param('id').notEmpty().isString(),
  body('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PROSPECT', 'ARCHIVED']),
  body('contactEmail').optional().isEmail(),
];

// All routes require authentication
router.use(authenticate);

// Get customers with pagination and filtering
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PROSPECT', 'ARCHIVED']),
    query('priority').optional().isIn(['HIGH', 'MEDIUM', 'LOW']),
  ],
  validate,
  getCustomers
);

// Get customer statistics
router.get('/statistics', getCustomerStatistics);

// Get single customer
router.get('/:id', [param('id').notEmpty().isString()], validate, getCustomerById);

// Create new customer (requires manager or admin role)
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  createCustomerValidation,
  validate,
  createCustomer
);

// Update customer (requires manager or admin role)
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  updateCustomerValidation,
  validate,
  updateCustomer
);

// Delete (archive) customer (requires admin role)
router.delete(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  [param('id').notEmpty().isString()],
  validate,
  deleteCustomer
);

export default router;