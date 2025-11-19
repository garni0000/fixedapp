import { PrismaClient } from '@prisma/client';
import env from './env';
import logger from '../utils/logger';

const globalForPrisma = global as typeof global & {
  prisma?: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn']
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma
  .$connect()
  .then(() => logger.info('✅ Connected to PostgreSQL via Prisma'))
  .catch((error) => logger.error({ error }, '❌ Failed to connect to PostgreSQL'));

export default prisma;

