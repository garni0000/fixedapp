import jwt from 'jsonwebtoken';
import env from '../config/env';
import { AppError } from './errors';

export interface TokenPayload {
  userId: string;
  role: string;
}

const signToken = (payload: TokenPayload, secret: string, expiresIn: string) =>
  jwt.sign(payload, secret, { expiresIn });

export const signAccessToken = (payload: TokenPayload) => signToken(payload, env.JWT_SECRET, '15m');

export const signRefreshToken = (payload: TokenPayload) => signToken(payload, env.REFRESH_SECRET, '30d');

export const signPasswordResetToken = (payload: TokenPayload) => signToken(payload, env.JWT_SECRET, '1h');

const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401, error);
  }
};

export const verifyAccessToken = (token: string) => verifyToken(token, env.JWT_SECRET);

export const verifyRefreshToken = (token: string) => verifyToken(token, env.REFRESH_SECRET);

export const verifyPasswordResetToken = (token: string) => verifyToken(token, env.JWT_SECRET);

