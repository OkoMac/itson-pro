import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getStockMovements, adjustStock, getLowStockProducts, getStockSummary } from '../controllers/stock.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('productId').optional().trim(),
  query('movementType').optional().trim(),
], validate, getStockMovements);

router.get('/summary', getStockSummary);
router.get('/low-stock', getLowStockProducts);

router.post('/adjust', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('movementType').notEmpty().isIn(['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'WRITE_OFF', 'TRANSFER']),
  body('reference').optional().trim(),
  body('notes').optional().trim(),
], validate, adjustStock);

export default router;
