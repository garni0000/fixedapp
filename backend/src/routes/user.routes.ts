import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, getProfile);
router.put('/me/update', authenticate, updateProfile);

export default router;

