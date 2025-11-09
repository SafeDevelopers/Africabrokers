# ---------- base ----------
  FROM node:20-bookworm-slim AS base
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
  RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
  
  # ---------- deps (install only what we need for this workspace) ----------
  FROM base AS deps
  # Copy workspace manifests (repo root)
  COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
  # Copy workspace package.json files so pnpm can resolve workspace dependencies
  COPY packages/config/env/package.json packages/config/env/
  COPY packages/lib/package.json packages/lib/
  # Copy the service manifest so pnpm can filter-install
  COPY services/core-api/package.json services/core-api/
  # Install deps for the service (includes prisma & @prisma/client)
  # Use --include-workspace-root to ensure all dependencies are installed
  # This will also install workspace dependencies (@afribrok/env, @afribrok/lib)
  RUN pnpm -F @afribrok/core-api install --frozen-lockfile --include-workspace-root
  # Verify Prisma was installed (check multiple possible locations)
  RUN echo "=== Verifying Prisma installation ===" && \
      (test -f /app/services/core-api/node_modules/.bin/prisma && echo "Found in service node_modules" || \
       test -f /app/node_modules/.bin/prisma && echo "Found in root node_modules" || \
       (find /app -path "*/node_modules/.bin/prisma" 2>/dev/null | head -1 && echo "Found via search")) && \
      echo "Prisma binary verified" || \
      (echo "WARNING: Prisma binary not found after install" && \
       echo "Checking service node_modules..." && \
       ls -la /app/services/core-api/node_modules/.bin/ 2>/dev/null | head -10 || true && \
       echo "Checking root node_modules..." && \
       ls -la /app/node_modules/.bin/ 2>/dev/null | head -10 || true)
  
  # ---------- build (generate prisma, build TS) ----------
  FROM deps AS build
  # Copy the full repo so prisma/schema etc are available
  COPY . .
  # Avoid any workspace-level postinstall from firing too early
  ENV PRISMA_SKIP_POSTINSTALL=1
  # Build workspace dependencies first (they need to be compiled before core-api can use them)
  WORKDIR /app
  RUN echo "=== Building workspace dependencies ===" && \
      pnpm --filter @afribrok/env build && \
      pnpm --filter @afribrok/lib build || \
      (echo "ERROR: Failed to build workspace dependencies" && exit 1)
  # Sanity: schema must exist
  RUN test -f services/core-api/prisma/schema.prisma || (echo "ERROR: prisma/schema.prisma not found" && ls -la services/core-api/prisma/ && exit 1)
  # Generate Prisma Client
  # Change to service directory where prisma schema is located
  WORKDIR /app/services/core-api
  # Verify Prisma is available
  RUN echo "=== Checking Prisma installation ===" && \
      pnpm exec prisma --version || \
      (echo "ERROR: Prisma CLI not found" && \
       find /app -path "*/node_modules/.bin/prisma" 2>/dev/null | head -5 && \
       exit 1)
  # Generate Prisma Client (schema.prisma is in prisma/ directory relative to service root)
  RUN pnpm exec prisma generate
  # Build TypeScript to JavaScript
  RUN pnpm run build
  
  # ---------- runtime ----------
  FROM base AS runner
  WORKDIR /app/services/core-api
  # Copy built service
  COPY --from=build /app/services/core-api ./
  # Copy node_modules (includes workspace dependencies)
  COPY --from=deps /app/node_modules /app/node_modules
  COPY --from=deps /app/services/core-api/node_modules ./node_modules
  # Copy built workspace packages (they need dist/ folders for runtime)
  COPY --from=build /app/packages/config/env/dist /app/packages/config/env/dist
  COPY --from=build /app/packages/lib/dist /app/packages/lib/dist
  # Use start:prod to run the compiled JavaScript directly
  CMD ["pnpm","run","start:prod"]