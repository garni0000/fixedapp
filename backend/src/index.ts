import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { ZodError } from 'zod';
import env from './config/env';
import logger from './utils/logger';
import { apiLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import pronoRoutes from './routes/prono.routes';
import subscriptionRoutes from './routes/subscription.routes';
import referralRoutes from './routes/referral.routes';
import transactionRoutes from './routes/transaction.routes';
import adminRoutes from './routes/admin.routes';
import { AppError } from './utils/errors';

const app = express();

const allowedOrigins = env.APP_URL.split(',').map((origin) => origin.trim());
const allowAllOrigins = allowedOrigins.includes('*');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(pinoHttp({ logger }));
app.use(apiLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/pronos', pronoRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/referral', referralRoutes);
app.use('/transactions', transactionRoutes);
app.use('/admin', adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ message: 'Validation error', issues: err.errors });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ message: 'Internal server error' });
});

const port = env.PORT;

export const startServer = () => {
  return app.listen(port, () => {
    logger.info(`🚀 FixedPronos API ready on port ${port}`);
  });
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

export default app;

