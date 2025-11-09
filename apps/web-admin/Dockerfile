# syntax=docker/dockerfile:1.7-labs

# ---------- base ----------
  FROM node:20-bookworm-slim AS base
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
  RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV CI=1
  
  # ---------- deps ----------
  FROM base AS deps
  COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
  COPY apps/web-admin/package.json apps/web-admin/
  # change filter to your actual package name if different
  RUN pnpm -F @afribrok/web-admin install --frozen-lockfile
  
  # ---------- build ----------
  FROM deps AS build
  COPY . .
  WORKDIR /app/apps/web-admin
  RUN pnpm build
  
  # ---------- runtime ----------
  FROM base AS runner
  ENV NODE_ENV=production
  WORKDIR /app/apps/web-admin
  COPY --from=build /app/apps/web-admin/.next ./.next
  COPY --from=build /app/apps/web-admin/public ./public
  COPY --from=deps  /app/apps/web-admin/node_modules ./node_modules
  COPY --from=build /app/apps/web-admin/package.json ./
  EXPOSE 3000
  ENV PORT=3000
  CMD ["pnpm", "start"]