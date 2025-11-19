import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  forgotPassword,
  login,
  refresh,
  register,
  resetPassword
} from '../services/auth.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  referralCode: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

const forgotSchema = z.object({
  email: z.string().email()
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = registerSchema.parse(req.body);
    const data = await register(payload);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = loginSchema.parse(req.body);
    const data = await login(payload);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = refreshSchema.parse(req.body);
    const data = await refresh(payload.refreshToken);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = forgotSchema.parse(req.body);
    await forgotPassword(payload.email);
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = resetSchema.parse(req.body);
    await resetPassword(payload.token, payload.password);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

