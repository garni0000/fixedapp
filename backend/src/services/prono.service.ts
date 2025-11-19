import { addDays, endOfDay, startOfDay } from 'date-fns';
import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/errors';

export const getPronosByDayOffset = async (offset: number) => {
  const targetDate = addDays(new Date(), offset);
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  return prisma.prono.findMany({
    where: {
      matchTime: {
        gte: start,
        lte: end
      },
      status: 'published'
    },
    orderBy: { matchTime: 'asc' }
  });
};

export const getPronoById = async (id: string) => {
  const prono = await prisma.prono.findUnique({ where: { id } });
  if (!prono) {
    throw new AppError('Prono not found', 404);
  }
  return prono;
};

interface PronoInput {
  title: string;
  sport: string;
  competition: string;
  matchTime: Date;
  tip: string;
  odd: number;
  confidence: number;
  content: string;
  result?: string;
  status?: string;
}

export const createProno = (input: PronoInput) =>
  prisma.prono.create({
    data: {
      ...input,
      odd: new Prisma.Decimal(input.odd),
      result: input.result ?? 'pending',
      status: input.status ?? 'draft'
    }
  });

export const updateProno = async (id: string, input: Partial<PronoInput>) => {
  await getPronoById(id);
  return prisma.prono.update({
    where: { id },
    data: {
      ...input,
      odd: input.odd !== undefined ? new Prisma.Decimal(input.odd) : undefined
    }
  });
};

export const deleteProno = async (id: string) => {
  await getPronoById(id);
  await prisma.prono.delete({ where: { id } });
};

