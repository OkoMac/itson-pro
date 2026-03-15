import { Router } from 'express';
import { query } from 'express-validator';
import { getDashboardSummary, getSystemEvents } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDashboardSummary);

router.get('/events', [
  query('entityType').optional().trim(),
  query('eventType').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
], validate, getSystemEvents);

export default router;
