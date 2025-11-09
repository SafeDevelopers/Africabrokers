# syntax=docker/dockerfile:1.7-labs

# ---------- base ----------
  FROM node:20-bookworm-slim AS base
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
  # use pnpm via corepack
  RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV CI=1
  
  # ---------- deps (monorepo-aware, filtered install) ----------
  FROM base AS deps
  # copy root manifests for pnpm workspaces
  COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
  # copy only web-admin manifest first for better cache hits
  COPY apps/web-admin/package.json apps/web-admin/
  # IMPORTANT: install only the web-admin workspace deps
  # (change the filter if your package name differs)
  RUN pnpm -F @afribrok/web-admin install --frozen-lockfile
  
  # ---------- build ----------
  FROM deps AS build
  # now copy the rest of the repo
  COPY . .
  WORKDIR /app/apps/web-admin
  # Use BuildKit cache mount for Next.js incremental build cache
  RUN --mount=type=cache,target=/app/apps/web-admin/.next/cache pnpm build
  
  # ---------- runtime ----------
  FROM base AS runner
  ENV NODE_ENV=production
  WORKDIR /app/apps/web-admin
  
  # copy runtime artifacts only
  COPY --from=build /app/apps/web-admin/.next ./.next
  COPY --from=build /app/apps/web-admin/public ./public
  COPY --from=deps  /app/apps/web-admin/node_modules ./node_modules
  COPY --from=build /app/apps/web-admin/package.json ./
  
  EXPOSE 3000
  ENV PORT=3000
  CMD ["pnpm", "start"]