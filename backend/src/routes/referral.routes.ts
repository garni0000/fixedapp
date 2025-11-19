import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { referralStats, withdrawReferral } from '../controllers/referral.controller';

const router = Router();

router.get('/stats', authenticate, referralStats);
router.post('/withdraw', authenticate, withdrawReferral);

export default router;

