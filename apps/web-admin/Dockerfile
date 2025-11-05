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
  ENV NODE_ENV=production
  RUN pnpm build
  # Ensure public exists to make COPY robust
  RUN mkdir -p /app/apps/web-admin/public
  
  # ---------- runtime ----------
  FROM node:20-alpine AS production
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=3000
  
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