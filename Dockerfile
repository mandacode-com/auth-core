# =============================
# 1. Build Stage
# =============================
FROM node:23-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies (including devDependencies for build process)
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS application
RUN npm run build

# =============================
# 2. Prune Stage (Remove Dev Dependencies)
# =============================
FROM node:23-alpine AS pruner

WORKDIR /app

# Copy node_modules and package.json from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Remove devDependencies to reduce final image size
RUN npm prune --production

# Copy Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# =============================
# 3. Final Runtime Stage
# =============================
FROM node:23-alpine AS runtime

WORKDIR /app

# Set non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built app and production dependencies
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Copy Prisma Client
COPY --from=pruner /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=pruner /app/node_modules/@prisma ./node_modules/@prisma

# Expose application port
EXPOSE 3000

# Set default command
CMD ["node", "dist/main.js"]
