import { nanoid } from 'nanoid';
import prisma from '../config/db';
import { AppError } from '../utils/errors';

interface SubscriptionInput {
  userId: string;
  plan: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export const getSubscriptionStatus = async (userId: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { currentPeriodEnd: 'desc' }
  });

  const active =
    !!subscription &&
    subscription.status === 'active' &&
    subscription.currentPeriodEnd.getTime() > Date.now();

  return { active, subscription };
};

export const listAllSubscriptions = () =>
  prisma.subscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: { currentPeriodEnd: 'desc' }
  });

export const createManualSubscription = async (input: SubscriptionInput) => {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (input.currentPeriodEnd <= input.currentPeriodStart) {
    throw new AppError('currentPeriodEnd must be after currentPeriodStart', 400);
  }

  return prisma.subscription.create({
    data: {
      userId: input.userId,
      plan: input.plan,
      status: input.status,
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd,
      reference: `manual_${nanoid(16)}`
    }
  });
};

export const updateManualSubscription = async (id: string, data: Partial<SubscriptionInput>) => {
  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Subscription not found', 404);
  }

  const nextStart = data.currentPeriodStart ?? existing.currentPeriodStart;
  const nextEnd = data.currentPeriodEnd ?? existing.currentPeriodEnd;

  if (nextEnd <= nextStart) {
    throw new AppError('currentPeriodEnd must be after currentPeriodStart', 400);
  }

  return prisma.subscription.update({
    where: { id },
    data: {
      ...data
    }
  });
};

export const deleteManualSubscription = async (id: string) => {
  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Subscription not found', 404);
  }

  await prisma.subscription.delete({ where: { id } });
};

