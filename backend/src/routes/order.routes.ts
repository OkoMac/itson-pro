import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStatistics,
  updateOrderLineStatus,
  addOrderLine,
  removeOrderLine,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const createOrderValidation = [
  body('orderId').notEmpty().trim(),
  body('customerId').notEmpty().isString(),
  body('dueDate').notEmpty().isISO8601(),
  body('lines').isArray({ min: 1 }),
  body('lines.*.sku').notEmpty().trim(),
  body('lines.*.qty').isInt({ min: 1 }),
  body('lines.*.unitPrice').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']),
  body('currentStage').optional().isIn(['ORDER_RECEIVED', 'PROCUREMENT', 'IN_PRODUCTION', 'WAITING_FOR_STOCK', 'FILLING', 'BRANDING', 'DISPATCH_READY', 'DISPATCHED', 'DELIVERED']),
  body('riskStatus').optional().isIn(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
];

const updateOrderValidation = [
  param('id').notEmpty().isString(),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']),
  body('currentStage').optional().isIn(['ORDER_RECEIVED', 'PROCUREMENT', 'IN_PRODUCTION', 'WAITING_FOR_STOCK', 'FILLING', 'BRANDING', 'DISPATCH_READY', 'DISPATCHED', 'DELIVERED']),
  body('riskStatus').optional().isIn(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('dueDate').optional().isISO8601(),
];

const updateOrderLineValidation = [
  param('orderId').notEmpty().isString(),
  param('lineId').notEmpty().isString(),
  body('status').notEmpty().isIn(['PENDING', 'ALLOCATED', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
];

const addOrderLineValidation = [
  param('orderId').notEmpty().isString(),
  body('sku').notEmpty().trim(),
  body('qty').isInt({ min: 1 }),
  body('unitPrice').optional().isFloat({ min: 0 }),
];

// All routes require authentication
router.use(authenticate);

// Get orders with pagination and filtering
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']),
    query('riskStatus').optional().isIn(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    query('customerId').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('sortBy').optional().isIn(['createdAt', 'dueDate', 'value', 'orderId']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  validate,
  getOrders
);

// Get order statistics
router.get('/statistics', getOrderStatistics);

// Get single order
router.get('/:id', [param('id').notEmpty().isString()], validate, getOrderById);

// Create new order (requires manager or admin role)
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  createOrderValidation,
  validate,
  createOrder
);

// Update order (requires manager or admin role)
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  updateOrderValidation,
  validate,
  updateOrder
);

// Delete (cancel) order (requires manager or admin role)
router.delete(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  [param('id').notEmpty().isString()],
  validate,
  deleteOrder
);

// Order line management routes
router.put(
  '/:orderId/lines/:lineId/status',
  authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  updateOrderLineValidation,
  validate,
  updateOrderLineStatus
);

router.post(
  '/:orderId/lines',
  authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  addOrderLineValidation,
  validate,
  addOrderLine
);

router.delete(
  '/:orderId/lines/:lineId',
  authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  [
    param('orderId').notEmpty().isString(),
    param('lineId').notEmpty().isString(),
  ],
  validate,
  removeOrderLine
);

export default router;