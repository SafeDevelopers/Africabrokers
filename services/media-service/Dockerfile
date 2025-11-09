# -------- base --------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN apk add --no-cache openssl1.1-compat && \
      corepack enable && corepack prepare pnpm@8.15.0 --activate
  WORKDIR /app
  
  # -------- deps (workspace-aware; dev+prod) --------
  FROM base AS deps
  # Root manifests for workspace resolution
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  # Workspace package manifests so pnpm can resolve without full sources yet
  COPY packages/config/env/package.json ./packages/config/env/
  # add more package.json manifests here if media-service depends on other workspaces
  COPY services/media-service/package.json ./services/media-service/
  # Install all deps (dev + prod) per lockfile (keeps CLI/tools available for build)
  RUN pnpm -w install --frozen-lockfile
  
  # -------- build --------
  FROM deps AS build
  # Bring in full source
  COPY . .
  # Build shared workspaces first (no-op if none / or if they’re pure JS)
  RUN pnpm -w --filter @afribrok/config... build || true
  
  # If this service uses Prisma, uncomment these two lines:
  # WORKDIR /app/services/media-service
  # RUN pnpm prisma generate
  
  # Build the service (NestJS or plain TS)
  WORKDIR /app/services/media-service
  RUN pnpm build
  
  # -------- runtime (no installs) --------
  FROM node:20-alpine AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=3000
  
  # Install pnpm in runtime stage (needed to resolve pnpm symlinks)
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  
  # Copy root package files (needed for module resolution)
  COPY --from=build /app/package.json ./package.json
  COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
  COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
  
  # Copy compiled output
  COPY --from=build /app/services/media-service/dist ./dist
  # Copy full node_modules from build (includes Nest + any workspace-linked deps)
  # pnpm uses symlinks and a content-addressable store (.pnpm), so we need to copy both
  COPY --from=build /app/node_modules ./node_modules
  # Minimal manifest (handy for tooling)
  COPY --from=build /app/services/media-service/package.json ./package.json
  
  # Set NODE_PATH to ensure module resolution works correctly
  ENV NODE_PATH=/app/node_modules
  
  EXPOSE 3000
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["node", "dist/main.js"]
