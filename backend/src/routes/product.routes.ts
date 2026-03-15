import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductStatistics } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('status').optional().isIn(['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'PRE_ORDER']),
  query('lowStock').optional().isBoolean(),
], validate, getProducts);

router.get('/statistics', getProductStatistics);
router.get('/:id', [param('id').notEmpty()], validate, getProductById);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), [
  body('sku').notEmpty().trim(),
  body('productName').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('unitPrice').isFloat({ min: 0 }),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('stockOnHand').optional().isInt({ min: 0 }),
  body('reorderLevel').optional().isInt({ min: 0 }),
  body('leadTimeDays').optional().isInt({ min: 0 }),
], validate, createProduct);

router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), [
  param('id').notEmpty(),
  body('unitPrice').optional().isFloat({ min: 0 }),
  body('stockOnHand').optional().isInt({ min: 0 }),
], validate, updateProduct);

router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteProduct);

export default router;
