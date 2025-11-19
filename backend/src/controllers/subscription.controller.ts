import { NextFunction, Request, Response } from 'express';
import { getSubscriptionStatus } from '../services/subscription.service';
import { AppError } from '../utils/errors';

export const subscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    const status = await getSubscriptionStatus(req.user.id);
    res.json(status);
  } catch (error) {
    next(error);
  }
};

