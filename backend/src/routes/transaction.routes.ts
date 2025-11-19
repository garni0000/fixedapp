import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listMyTransactions } from '../controllers/transaction.controller';

const router = Router();

router.get('/', authenticate, listMyTransactions);

export default router;

