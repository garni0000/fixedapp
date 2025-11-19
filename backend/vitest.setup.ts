process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/fixedpronos?schema=public';
process.env.JWT_SECRET ??= 'test_jwt_secret';
process.env.REFRESH_SECRET ??= 'test_refresh_secret';
process.env.SMTP_HOST ??= 'smtp.test';
process.env.SMTP_USER ??= 'user';
process.env.SMTP_PASS ??= 'pass';
process.env.APP_URL ??= 'http://localhost:5173';
process.env.PORT ??= '4000';
process.env.EMAIL_FROM ??= 'test@fixedpronos.com';

