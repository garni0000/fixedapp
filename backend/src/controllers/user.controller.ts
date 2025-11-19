import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { AppError } from '../utils/errors';

const updateSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    password: z.string().min(8).optional(),
    currentPassword: z.string().min(8).optional()
  })
  .refine((data) => {
    if (data.password && !data.currentPassword) {
      return false;
    }
    return true;
  }, 'Current password is required to set a new password');

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        referralCode: true,
        referredById: true,
        balanceCommission: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const payload = updateSchema.parse(req.body);
    const updates: Record<string, unknown> = {};

    if (payload.name) {
      updates.name = payload.name;
    }

    if (payload.password) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        throw new AppError('User not found', 404);
      }
      const valid = await bcrypt.compare(payload.currentPassword!, user.passwordHash);
      if (!valid) {
        throw new AppError('Current password is invalid', 400);
      }
      updates.passwordHash = await bcrypt.hash(payload.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        referralCode: true,
        referredById: true,
        balanceCommission: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};

