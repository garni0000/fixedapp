import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { approveWithdrawal, getAllTransactions } from '../services/transaction.service';
import { AppError } from '../utils/errors';
import {
  createManualSubscription,
  deleteManualSubscription,
  listAllSubscriptions,
  updateManualSubscription
} from '../services/subscription.service';

export const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balanceCommission: true,
        referralCode: true,
        createdAt: true
      }
    });
    const normalized = users.map((user) => ({
      ...user,
      balanceCommission: Number(user.balanceCommission)
    }));
    res.json({ users: normalized });
  } catch (error) {
    next(error);
  }
};

export const adminStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, activeSubscriptions, payments, commissions] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: { status: 'active', currentPeriodEnd: { gt: new Date() } }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'payment', status: 'succeeded' }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'commission', status: 'succeeded' }
      })
    ]);

    res.json({
      totalUsers,
      activeSubscriptions,
      totalRevenue: Number(payments._sum.amount ?? 0),
      totalCommissions: Number(commissions._sum.amount ?? 0)
    });
  } catch (error) {
    next(error);
  }
};

export const adminTransactions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await getAllTransactions();
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

const approveSchema = z.object({
  id: z.string().min(1)
});

const manualSubscriptionSchema = z.object({
  userId: z.string().min(1),
  plan: z.string().min(1),
  status: z.enum(['active', 'paused', 'canceled', 'expired']).default('active'),
  currentPeriodStart: z.coerce.date(),
  currentPeriodEnd: z.coerce.date()
});

const manualSubscriptionUpdateSchema = z
  .object({
    plan: z.string().min(1).optional(),
    status: z.enum(['active', 'paused', 'canceled', 'expired']).optional(),
    currentPeriodStart: z.coerce.date().optional(),
    currentPeriodEnd: z.coerce.date().optional()
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'Provide at least one field to update'
  );

export const approvePayoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    const { id } = approveSchema.parse(req.params);
    await approveWithdrawal(id, req.user.id);
    res.json({ message: 'Payout approved' });
  } catch (error) {
    next(error);
  }
};

export const listAdminSubscriptions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await listAllSubscriptions();
    res.json({ subscriptions });
  } catch (error) {
    next(error);
  }
};

export const createManualSubscriptionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = manualSubscriptionSchema.parse(req.body);
    const subscription = await createManualSubscription(payload);
    res.status(201).json({ subscription });
  } catch (error) {
    next(error);
  }
};

export const updateManualSubscriptionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = approveSchema.parse(req.params);
    const payload = manualSubscriptionUpdateSchema.parse(req.body);
    const subscription = await updateManualSubscription(id, payload);
    res.json({ subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteManualSubscriptionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = approveSchema.parse(req.params);
    await deleteManualSubscription(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

