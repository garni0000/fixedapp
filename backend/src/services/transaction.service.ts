import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/errors';

interface TransactionInput {
  userId: string;
  type: 'payment' | 'refund' | 'commission' | 'payout';
  amount: number;
  currency: string;
  provider: string;
  providerId?: string | null;
  status?: string;
}

export const recordTransaction = (input: TransactionInput) => {
  return prisma.transaction.create({
    data: {
      userId: input.userId,
      type: input.type,
      amount: new Prisma.Decimal(input.amount),
      currency: input.currency.toUpperCase(),
      provider: input.provider,
      providerId: input.providerId ?? null,
      status: input.status ?? (input.type === 'payment' ? 'succeeded' : 'pending')
    }
  });
};

export const getUserTransactions = (userId: string) =>
  prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

export const getAllTransactions = () =>
  prisma.transaction.findMany({
    include: {
      user: {
        select: { id: true, email: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

export const approveWithdrawal = async (transactionId: string, adminId: string) => {
  const payout = await prisma.transaction.findUnique({
    where: { id: transactionId }
  });

  if (!payout) {
    throw new AppError('Transaction not found', 404);
  }

  if (payout.type !== 'payout' || payout.status !== 'pending') {
    throw new AppError('Only pending payout transactions can be approved', 400);
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: payout.userId } });
    if (!user) {
      throw new AppError('User not found for payout', 404);
    }

    const amount = Number(payout.amount);
    if (Number(user.balanceCommission) < amount) {
      throw new AppError('Insufficient commission balance', 400);
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        balanceCommission: new Prisma.Decimal(Number(user.balanceCommission) - amount)
      }
    });

    await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'succeeded',
        providerId: adminId
      }
    });
  });
};

