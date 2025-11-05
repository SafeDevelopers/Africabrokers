# Multi-stage build for core-api
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

FROM base AS dependencies

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/env/package.json ./packages/config/env/
COPY packages/config/design-tokens/package.json ./packages/config/design-tokens/
COPY packages/lib/package.json ./packages/lib/
COPY services/core-api/package.json ./services/core-api/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM dependencies AS build

WORKDIR /app

# Copy all source code
COPY . .

# Build dependencies first
RUN pnpm --filter @afribrok/config... build || true
RUN pnpm --filter @afribrok/lib... build || true

# Generate Prisma client
WORKDIR /app/services/core-api
RUN pnpm prisma generate

# Build core-api
RUN pnpm build

FROM base AS production

WORKDIR /app

# Install pnpm for production dependencies
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy package files for dependency installation
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/services/core-api/package.json ./package.json

# Copy built application
COPY --from=build /app/services/core-api/dist ./dist
COPY --from=build /app/services/core-api/prisma ./prisma
COPY --from=build /app/packages ./packages

# Install only production dependencies
RUN pnpm install --prod --no-frozen-lockfile || true

# Set port environment variable
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/v1/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application
CMD ["node", "dist/main.js"]

