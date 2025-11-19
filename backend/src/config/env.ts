import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  REFRESH_SECRET: z.string().min(10, 'REFRESH_SECRET must be at least 10 characters'),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  APP_URL: z.string().min(1, 'APP_URL is required'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),
  REFERRAL_COMMISSION_RATE: z.coerce.number().min(0).max(1).default(0.3)
});

const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/fixedpronos?schema=public',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev_jwt_secret',
  REFRESH_SECRET: process.env.REFRESH_SECRET ?? 'dev_refresh_secret',
  SMTP_HOST: process.env.SMTP_HOST ?? 'smtp.dev',
  SMTP_USER: process.env.SMTP_USER ?? 'user',
  SMTP_PASS: process.env.SMTP_PASS ?? 'pass',
  APP_URL: process.env.APP_URL ?? 'http://localhost:5173',
  EMAIL_FROM: process.env.EMAIL_FROM ?? 'no-reply@fixedpronos.com',
  REFERRAL_COMMISSION_RATE: process.env.REFERRAL_COMMISSION_RATE
});

export default env;

