import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { subscriptionStatus } from '../controllers/subscription.controller';

const router = Router();

router.get('/status', authenticate, subscriptionStatus);

export default router;

