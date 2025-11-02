# Multi-stage build for web-marketplace
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

FROM base AS dependencies

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/config/env/package.json ./packages/config/env/
COPY packages/config/design-tokens/package.json ./packages/config/design-tokens/
COPY packages/lib/package.json ./packages/lib/
COPY packages/ui/package.json ./packages/ui/
COPY apps/web-marketplace/package.json ./apps/web-marketplace/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM dependencies AS build

WORKDIR /app

# Copy all source code
COPY . .

# Build dependencies first
RUN pnpm --filter @afribrok/config... build || true
RUN pnpm --filter @afribrok/lib... build || true
RUN pnpm --filter @afribrok/ui... build || true

# Build Next.js app
WORKDIR /app/apps/web-marketplace
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM base AS production

WORKDIR /app

# Copy built application
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web-marketplace/.next/standalone ./
COPY --from=build /app/apps/web-marketplace/.next/static ./apps/web-marketplace/.next/static
COPY --from=build /app/apps/web-marketplace/public ./apps/web-marketplace/public
COPY --from=build /app/apps/web-marketplace/package.json ./apps/web-marketplace/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/web-marketplace

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/ || exit 1

# Run the application
ENV NODE_ENV=production
ENV PORT=3003
CMD ["node", "server.js"]

