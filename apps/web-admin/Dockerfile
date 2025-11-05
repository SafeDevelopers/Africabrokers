# ---------- base ----------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable
  WORKDIR /app
  
  # ---------- deps (monorepo-aware) ----------
  FROM base AS deps
  COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
  # Copy all package.json files needed for workspace resolution
  COPY packages/config/env/package.json ./packages/config/env/
  COPY packages/config/design-tokens/package.json ./packages/config/design-tokens/
  COPY packages/lib/package.json ./packages/lib/
  COPY packages/ui/package.json ./packages/ui/
  COPY apps/web-admin/package.json ./apps/web-admin/
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
  WORKDIR /app/apps/web-admin
  ENV NEXT_TELEMETRY_DISABLED=1
  RUN pnpm build
  # Ensure public exists to make COPY robust
  RUN mkdir -p /app/apps/web-admin/public
  
  # ---------- runtime ----------
  FROM node:20-alpine AS production
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=3000
  
  # Next.js standalone output
  COPY --from=build /app/apps/web-admin/.next/standalone ./
  COPY --from=build /app/apps/web-admin/.next/static ./apps/web-admin/.next/static
  COPY --from=build /app/apps/web-admin/public ./apps/web-admin/public
  COPY --from=build /app/apps/web-admin/package.json ./apps/web-admin/
  
  EXPOSE 3000
  CMD ["node", "server.js"]