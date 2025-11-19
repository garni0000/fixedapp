import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { getReferralStats, requestWithdrawal } from '../services/referral.service';
import { AppError } from '../utils/errors';

const withdrawSchema = z.object({
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).default('EUR')
});

export const referralStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    const stats = await getReferralStats(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const withdrawReferral = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    const payload = withdrawSchema.parse(req.body);
    const transaction = await requestWithdrawal(req.user.id, payload.amount, payload.currency);
    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

