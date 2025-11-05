# ---------- base ----------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable
  WORKDIR /app
  
  # ---------- deps (monorepo-aware) ----------
  FROM base AS deps
  COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
  # add any package.json that Next build needs to resolve workspaces
  COPY apps/web-admin/package.json ./apps/web-admin/
  # (for marketplace, replace paths accordingly)
  RUN pnpm -w install --frozen-lockfile
  
  # ---------- build ----------
  FROM deps AS build
  COPY . .
  # build the app you’re targeting:
  RUN pnpm -w --filter @afribrok/web-admin build
  # ensure public exists to make COPY robust
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