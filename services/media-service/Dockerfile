# Multi-stage build for media-service
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

FROM base AS dependencies

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/config/env/package.json ./packages/config/env/
COPY services/media-service/package.json ./services/media-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM dependencies AS build

WORKDIR /app

# Copy all source code
COPY . .

# Build dependencies first
RUN pnpm --filter @afribrok/config... build || true

# Build media-service
WORKDIR /app/services/media-service
RUN pnpm build

FROM base AS production

WORKDIR /app

# Copy built application
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/media-service/dist ./dist
COPY --from=build /app/services/media-service/package.json ./
COPY --from=build /app/packages ./packages

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application
CMD ["node", "dist/main.js"]

