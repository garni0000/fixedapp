import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import {
  adminStats,
  adminTransactions,
  approvePayoutController,
  createManualSubscriptionController,
  deleteManualSubscriptionController,
  listAdminSubscriptions,
  listUsers,
  updateManualSubscriptionController
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/users', listUsers);
router.get('/stats', adminStats);
router.get('/transactions', adminTransactions);
router.post('/transactions/:id/approve', approvePayoutController);

router.get('/subscriptions', listAdminSubscriptions);
router.post('/subscriptions', createManualSubscriptionController);
router.put('/subscriptions/:id', updateManualSubscriptionController);
router.delete('/subscriptions/:id', deleteManualSubscriptionController);

export default router;

