FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json tsconfig.json prisma ./ 
RUN npm install
RUN npx prisma generate

COPY src ./src
COPY vitest.config.ts vitest.setup.ts ./ 
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY package*.json ./
COPY prisma ./prisma

CMD ["node", "dist/index.js"]

