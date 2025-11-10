# -------- base --------
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# -------- deps (workspace-aware; dev+prod) --------
FROM base AS deps
# Root manifests for workspace resolution
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Workspace package manifests so pnpm can resolve without full sources yet
COPY packages/config/env/package.json ./packages/config/env/
# add more package.json manifests here if media-service depends on other workspaces
COPY services/media-service/package.json ./services/media-service/
# Install all deps (dev + prod) per lockfile (keeps CLI/tools available for build)
RUN pnpm install --frozen-lockfile

# -------- build --------
FROM deps AS build
# Bring in full source
COPY . .
# Build shared workspaces first (no-op if none / or if they're pure JS)
WORKDIR /app
RUN pnpm -F @afribrok/env build || true

# If this service uses Prisma, uncomment these two lines:
# WORKDIR /app/services/media-service
# RUN pnpm prisma generate

# Build the service (NestJS or plain TS)
WORKDIR /app/services/media-service
RUN pnpm build

# -------- runtime (no installs) --------
FROM base AS runtime
# Ensure pnpm is available for workspace resolution
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# Copy workspace configuration files (needed for pnpm workspace resolution)
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/pnpm-lock.yaml ./

# Copy built workspace packages with full structure (package.json + dist)
COPY --from=build /app/packages/config/env ./packages/config/env

# Copy node_modules from build stage (includes Nest + any workspace-linked deps)
# This is critical: pnpm uses symlinks, so we need node_modules from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy built service
WORKDIR /app/services/media-service
COPY --from=build /app/services/media-service ./

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]
