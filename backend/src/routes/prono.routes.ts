import { Router } from 'express';
import {
  createPronoController,
  deletePronoController,
  getBeforeYesterdayPronos,
  getProno,
  getTodayPronos,
  getYesterdayPronos,
  updatePronoController
} from '../controllers/prono.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

router.get('/today', getTodayPronos);
router.get('/yesterday', getYesterdayPronos);
router.get('/before-yesterday', getBeforeYesterdayPronos);
router.get('/:id', getProno);

router.post('/', authenticate, requireAdmin, createPronoController);
router.put('/:id', authenticate, requireAdmin, updatePronoController);
router.delete('/:id', authenticate, requireAdmin, deletePronoController);

export default router;

