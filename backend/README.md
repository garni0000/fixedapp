# FixedPronos Backend

Node.js + TypeScript backend for the Fixed Edge Pro React/Vite frontend. It provides authentication, manually managed subscriptions, referral commissions, and an admin API ready for Render deployment.

## Stack

- Node.js 18+, Express, TypeScript
- Prisma ORM + PostgreSQL
- JWT access + refresh tokens
- Manual subscription management (admin tooling)
- Nodemailer (password reset)
- Zod validation
- Pino logging
- Helmet, CORS, express-rate-limit
- Docker & Render config

## Project Structure

```
backend
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── src
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── types
│   └── utils
├── Dockerfile
├── package.json
├── render.yaml
├── tsconfig.json
└── vitest.config.ts
```

## Getting Started

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Copy `.env.example` to `.env` and provide real values.

## Key Scripts

- `npm run dev` – start development server with reload
- `npm run build` – compile TypeScript
- `npm run start` – run compiled server
- `npm run prisma:migrate` – run migrations locally
- `npm run seed` – seed database (creates initial admin)
- `npm test` – run unit tests (Vitest)

## Render Deployment

Use the included `render.yaml`. Render will:

1. Install dependencies
2. Run `prisma migrate deploy`
3. Build TypeScript
4. Start with `npm run start`

Set environment variables in the Render dashboard (see `.env.example`).

## API Overview

- **Auth**: register, login, refresh, forgot/reset password
- **User**: profile, update profile
- **Pronos**: daily predictions (public) + admin CRUD
- **Subscription**: manual activation/extension by admins + status endpoint
- **Referral**: stats, withdraw requests (30% commissions)
- **Transactions**: user history + admin approvals
- **Admin**: users, stats, transactions, payout approvals, manual subscriptions

### Manual Subscription Workflow

- `GET /subscription/status` (user) → check if membership is active.
- Admin endpoints:
  - `GET /admin/subscriptions`
  - `POST /admin/subscriptions` (body: `userId`, `plan`, `status`, `currentPeriodStart`, `currentPeriodEnd`)
  - `PUT /admin/subscriptions/:id`
  - `DELETE /admin/subscriptions/:id`
- Use these routes from your admin UI to activate, extend, or cancel memberships without relying on Stripe/Coinbase.

## Tests

Vitest covers core utilities such as JWT helpers to guarantee cryptographic correctness and regression safety. Extend the suite as business logic grows.

