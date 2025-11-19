import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/errors';
import { recordTransaction } from './transaction.service';

interface AwardCommissionInput {
  referrerId: string;
  refereeId: string;
  amount: number;
  currency: string;
  providerId?: string | null;
}

export const awardCommission = async ({ referrerId, refereeId, amount, currency, providerId }: AwardCommissionInput) => {
  await prisma.$transaction(async (tx) => {
    await tx.referral.upsert({
      where: { refereeId },
      update: {
        commissionAmount: { increment: new Prisma.Decimal(amount) },
        paid: false
      },
      create: {
        referrerId,
        refereeId,
        commissionAmount: new Prisma.Decimal(amount),
        paid: false
      }
    });

    await tx.user.update({
      where: { id: referrerId },
      data: {
        balanceCommission: { increment: new Prisma.Decimal(amount) }
      }
    });

    await tx.transaction.create({
      data: {
        userId: referrerId,
        type: 'commission',
        amount: new Prisma.Decimal(amount),
        currency: currency.toUpperCase(),
        provider: 'system',
        providerId: providerId ?? `commission-${refereeId}`,
        status: 'succeeded'
      }
    });
  });
};

export const requestWithdrawal = async (userId: string, amount: number, currency: string) => {
  if (amount <= 0) {
    throw new AppError('Withdrawal amount must be greater than zero', 400);
  }

  const [user, pending] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: 'payout', status: 'pending' }
    })
  ]);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const pendingTotal = Number(pending._sum.amount ?? 0);
  const available = Number(user.balanceCommission) - pendingTotal;

  if (available < amount) {
    throw new AppError('Insufficient commission balance', 400);
  }

  return recordTransaction({
    userId,
    type: 'payout',
    amount,
    currency: currency.toUpperCase(),
    provider: 'internal',
    status: 'pending'
  });
};

export const getReferralStats = async (userId: string) => {
  const [user, referrals, pendingPayouts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { balanceCommission: true } }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          select: { email: true, name: true }
        }
      }
    }),
    prisma.transaction.findMany({
      where: { userId, type: 'payout', status: 'pending' }
    })
  ]);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const totalEarned = referrals.reduce((sum, referral) => sum + Number(referral.commissionAmount), 0);
  const pendingWithdrawals = pendingPayouts.reduce((sum, payout) => sum + Number(payout.amount), 0);

  return {
    totalEarned,
    availableBalance: Math.max(0, Number(user.balanceCommission) - pendingWithdrawals),
    pendingWithdrawals,
    referrals: referrals.map((referral) => ({
      id: referral.id,
      refereeEmail: referral.referee.email,
      refereeName: referral.referee.name,
      commissionAmount: Number(referral.commissionAmount),
      paid: referral.paid,
      createdAt: referral.createdAt
    }))
  };
};

