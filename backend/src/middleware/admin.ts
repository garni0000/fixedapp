import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    next(new AppError('Admin privileges required', 403));
    return;
  }
  next();
};

