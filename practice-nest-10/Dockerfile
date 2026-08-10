# =========================================================
# STAGE 1: Build stage
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm approve-builds --all

RUN pnpm i --frozen-lockfile

COPY . .

# 2. Bắt buộc phải generate Prisma Client trước khi build NestJS
RUN pnpm exec prisma generate
RUN pnpm run build

# =========================================================
# STAGE 2: Production stage
# =========================================================
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm approve-builds --all

RUN pnpm install --prod --frozen-lockfile

# 4. Copy kết quả build NestJS
COPY --from=builder /usr/src/app/dist ./dist

# 5. Copy Prisma Client đã generate từ Stage 1 sang (BẮT BUỘC)
COPY --from=builder /usr/src/app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

CMD ["node", "dist/main.js"]