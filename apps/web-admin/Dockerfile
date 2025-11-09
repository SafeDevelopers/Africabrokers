# ---------- base ----------
  FROM node:20-bookworm-slim AS base
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
  RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
  
  # ---------- deps (monorepo-aware) ----------
  FROM base AS deps
  # Copy workspace manifests (repo root)
  COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
  # Copy workspace package.json files so pnpm can resolve workspace dependencies
  COPY packages/config/env/package.json packages/config/env/
  COPY packages/config/design-tokens/package.json packages/config/design-tokens/
  COPY packages/lib/package.json packages/lib/
  COPY packages/ui/package.json packages/ui/
  # Copy the app manifest so pnpm can filter-install
  COPY apps/web-admin/package.json apps/web-admin/
  # Install deps for the app (includes workspace dependencies)
  # Use --include-workspace-root to ensure all dependencies are installed
  RUN pnpm -F @afribrok/web-admin install --frozen-lockfile --include-workspace-root
  
  # ---------- build ----------
  FROM deps AS build
  # Copy the full repo so workspace packages are available
  COPY . .
  # Avoid any workspace-level postinstall from firing too early
  ENV PRISMA_SKIP_POSTINSTALL=1
  # Build workspace dependencies first (they need to be compiled before web-admin can use them)
  # Note: design-tokens and ui don't have build scripts, only env and lib need building
  WORKDIR /app
  RUN echo "=== Building workspace dependencies ===" && \
      pnpm --filter @afribrok/env build && \
      pnpm --filter @afribrok/lib build || \
      (echo "ERROR: Failed to build workspace dependencies" && exit 1)
  # Build the app
  WORKDIR /app/apps/web-admin
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV NODE_ENV=production
  RUN pnpm build
  # Ensure public exists to make COPY robust
  RUN mkdir -p /app/apps/web-admin/public
  
  # ---------- runtime ----------
  FROM node:20-bookworm-slim AS production
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=3000
  RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
  
  # Next.js standalone output
  # Standalone output structure: standalone/ contains server.js and node_modules
  COPY --from=build /app/apps/web-admin/.next/standalone ./
  COPY --from=build /app/apps/web-admin/.next/static ./apps/web-admin/.next/static
  COPY --from=build /app/apps/web-admin/public ./apps/web-admin/public
  # Copy root node_modules for any hoisted dependencies (like styled-jsx)
  COPY --from=build /app/node_modules ./node_modules
  
  EXPOSE 3000
  # server.js is in apps/web-admin/ directory in standalone output
  # Change working directory to where server.js is located
  WORKDIR /app/apps/web-admin
  CMD ["node", "server.js"]