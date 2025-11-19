import type { User } from '@prisma/client';

type SafeUser = Omit<User, 'passwordHash'>;

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export {};

