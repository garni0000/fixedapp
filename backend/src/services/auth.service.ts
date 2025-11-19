import { Prisma, Role, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import prisma from '../config/db';
import { AppError } from '../utils/errors';
import {
  signAccessToken,
  signPasswordResetToken,
  signRefreshToken,
  verifyPasswordResetToken,
  verifyRefreshToken
} from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/email';
import env from '../config/env';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const sanitizeUser = (user: User) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const adminEmails = env.ADMIN_EMAILS
  ? env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  : [];

const ensureAdminRole = async (user: User) => {
  if (adminEmails.includes(user.email.toLowerCase()) && user.role !== Role.ADMIN) {
    return prisma.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN }
    });
  }
  return user;
};

const generateReferralCode = async () => {
  let code: string;
  let existing: User | null;
  do {
    code = nanoid(10).toUpperCase();
    existing = await prisma.user.findUnique({ where: { referralCode: code } });
  } while (existing);

  return code;
};

const createTokens = (user: User) => {
  const payload = { userId: user.id, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
};

export const register = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const referralCode = await generateReferralCode();

  let referredById: string | undefined;

  if (input.referralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: input.referralCode } });
    if (!referrer) {
      throw new AppError('Invalid referral code', 400);
    }
    referredById = referrer.id;
  }

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        referralCode,
        referredById
      }
    });

    if (referredById) {
      await tx.referral.create({
        data: {
          referrerId: referredById,
          refereeId: createdUser.id,
          commissionAmount: new Prisma.Decimal(0),
          paid: false
        }
      });
    }

    return createdUser;
  });

  const ensuredUser = await ensureAdminRole(user);
  const tokens = createTokens(ensuredUser);

  return {
    user: sanitizeUser(ensuredUser),
    ...tokens
  };
};

export const login = async (input: LoginInput) => {
  let user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  user = await ensureAdminRole(user);
  const tokens = createTokens(user);

  return {
    user: sanitizeUser(user),
    ...tokens
  };
};

export const refresh = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const ensuredUser = await ensureAdminRole(user);
  const tokens = createTokens(ensuredUser);
  return {
    user: sanitizeUser(ensuredUser),
    ...tokens
  };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return;
  }

  const token = signPasswordResetToken({ userId: user.id, role: user.role });
  await sendPasswordResetEmail(user.email, token);
};

export const resetPassword = async (token: string, password: string) => {
  const payload = verifyPasswordResetToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });
};

