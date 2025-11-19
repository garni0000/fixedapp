import { NextFunction, Request, Response } from 'express';
import { getUserTransactions } from '../services/transaction.service';
import { AppError } from '../utils/errors';

export const listMyTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    const transactions = await getUserTransactions(req.user.id);
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

