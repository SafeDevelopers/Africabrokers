# -------- base --------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  WORKDIR /app
  
  # -------- deps (workspace-aware; install dev+prod) --------
  FROM base AS deps
  # Root manifests
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  # Manifests for workspaces so pnpm can resolve without full source yet
  COPY packages/config/env/package.json ./packages/config/env/
  COPY packages/config/design-tokens/package.json ./packages/config/design-tokens/
  COPY packages/lib/package.json ./packages/lib/
  COPY services/core-api/package.json ./services/core-api/
  # Install all deps (dev + prod) per lockfile
  RUN pnpm -w install --frozen-lockfile
  
  # -------- build --------
  FROM deps AS build
  # Bring in full source
  COPY . .
  # Build local libs (must emit JS to dist/)
  RUN pnpm -w --filter @afribrok/lib build || true
  RUN pnpm -w --filter @afribrok/config... build || true
  
  # Generate Prisma client (DEV deps available here)
  WORKDIR /app/services/core-api
  RUN pnpm prisma generate
  
  # Build the NestJS service
  RUN pnpm build
  
  # -------- runtime (no prisma, no installs) --------
  FROM node:20-alpine AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=8080
  
  # Install pnpm for production dependency installation
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  
  # Copy root package files for workspace resolution
  COPY --from=build /app/package.json ./package.json
  COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
  COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
  
  # Copy workspace package.json files and built packages
  COPY --from=build /app/packages ./packages
  
  # Copy compiled app + prisma schema
  COPY --from=build /app/services/core-api/dist ./dist
  COPY --from=build /app/services/core-api/prisma ./prisma
  COPY --from=build /app/services/core-api/package.json ./services/core-api/package.json
  
  # Install production dependencies only (pnpm will handle workspace resolution)
  # This installs all dependencies including workspace packages
  RUN pnpm -w install --frozen-lockfile --prod --filter @afribrok/core-api...
  
  # Verify critical dependencies are installed
  RUN node -e "require('@nestjs/common')" || (echo "ERROR: @nestjs/common not found" && exit 1)
  
  EXPOSE 8080
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["node", "dist/main.js"]