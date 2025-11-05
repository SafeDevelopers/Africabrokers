# ---------- base ----------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable
  WORKDIR /app
  
  # ---------- deps (monorepo-aware) ----------
  FROM base AS deps
  # lockfiles + workspace manifest
  COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
  # Copy all package.json files needed for workspace resolution
  COPY packages/config/env/package.json ./packages/config/env/
  COPY packages/config/design-tokens/package.json ./packages/config/design-tokens/
  COPY packages/lib/package.json ./packages/lib/
  COPY packages/ui/package.json ./packages/ui/
  COPY apps/web-marketplace/package.json ./apps/web-marketplace/
  RUN pnpm -w install --frozen-lockfile
  
  # ---------- build ----------
  FROM deps AS build
  COPY . .
  # Build dependencies first
  WORKDIR /app
  RUN pnpm --filter @afribrok/config... build || true
  RUN pnpm --filter @afribrok/lib... build || true
  RUN pnpm --filter @afribrok/ui... build || true
  # Build the app
  WORKDIR /app/apps/web-marketplace
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV NODE_ENV=production
  RUN pnpm build
  # Ensure public exists to make COPY robust even if empty
  RUN mkdir -p /app/apps/web-marketplace/public
  
  # ---------- runtime ----------
  FROM node:20-alpine AS production
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=3000
  
  # Next.js standalone output
  COPY --from=build /app/apps/web-marketplace/.next/standalone ./
  COPY --from=build /app/apps/web-marketplace/.next/static ./apps/web-marketplace/.next/static
  COPY --from=build /app/apps/web-marketplace/public ./apps/web-marketplace/public
  COPY --from=build /app/apps/web-marketplace/package.json ./apps/web-marketplace/
  
  EXPOSE 3000
  CMD ["node", "server.js"]