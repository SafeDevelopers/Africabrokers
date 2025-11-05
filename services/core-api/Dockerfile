# -------- base --------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  WORKDIR /repo
  
  # -------- deps (workspace-aware) --------
  FROM base AS deps
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  # copy manifests only (no sources yet)
  COPY packages/config/env/package.json ./packages/config/env/
  COPY packages/config/design-tokens/package.json ./packages/config/design-tokens/
  COPY packages/lib/package.json ./packages/lib/
  COPY services/core-api/package.json ./services/core-api/
  RUN pnpm -w install --frozen-lockfile
  
  # -------- build --------
  FROM deps AS build
  COPY . .
  # build shared libs (no-op if none)
  RUN pnpm -w --filter @afribrok/config... build || true
  RUN pnpm -w --filter @afribrok/lib... build || true
  # Generate Prisma client and build the service directly
  WORKDIR /repo/services/core-api
  RUN pnpm prisma generate
  RUN pnpm build
  
  # -------- runtime --------
  FROM node:20-alpine AS runtime
  ENV NODE_ENV=production
  ENV PORT=3000
  WORKDIR /app
  # Copy built application and dependencies
  COPY --from=build /repo/services/core-api/dist ./dist
  COPY --from=build /repo/services/core-api/prisma ./prisma
  COPY --from=build /repo/services/core-api/package.json ./package.json
  COPY --from=build /repo/node_modules ./node_modules
  COPY --from=build /repo/packages ./packages
  
  EXPOSE 3000
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/v1/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["node", "dist/main.js"]