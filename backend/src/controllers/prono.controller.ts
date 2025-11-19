import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  createProno,
  deleteProno,
  getPronoById,
  getPronosByDayOffset,
  updateProno
} from '../services/prono.service';

const pronoSchema = z.object({
  title: z.string().min(3),
  sport: z.string().min(2),
  competition: z.string().min(2),
  matchTime: z.coerce.date(),
  tip: z.string().min(1),
  odd: z.coerce.number().positive(),
  confidence: z.coerce.number().int().min(1).max(100),
  content: z.string().min(5),
  result: z.enum(['won', 'lost', 'pending']).optional(),
  status: z.enum(['draft', 'published']).optional()
});

export const getTodayPronos = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pronos = await getPronosByDayOffset(0);
    res.json({ pronos });
  } catch (error) {
    next(error);
  }
};

export const getYesterdayPronos = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pronos = await getPronosByDayOffset(-1);
    res.json({ pronos });
  } catch (error) {
    next(error);
  }
};

export const getBeforeYesterdayPronos = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pronos = await getPronosByDayOffset(-2);
    res.json({ pronos });
  } catch (error) {
    next(error);
  }
};

export const getProno = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prono = await getPronoById(req.params.id);
    res.json({ prono });
  } catch (error) {
    next(error);
  }
};

export const createPronoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = pronoSchema.parse(req.body);
    const prono = await createProno(payload);
    res.status(201).json({ prono });
  } catch (error) {
    next(error);
  }
};

export const updatePronoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = pronoSchema.partial().parse(req.body);
    const prono = await updateProno(req.params.id, payload);
    res.json({ prono });
  } catch (error) {
    next(error);
  }
};

export const deletePronoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteProno(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

