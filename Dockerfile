FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN \
  if [ -f package-lock.json ]; then \
  npm ci; \
  npx prisma generate; \
  npm prune --production; \
  else \
  echo "no package-lock.json found" && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS release
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

CMD node dist/main.js
