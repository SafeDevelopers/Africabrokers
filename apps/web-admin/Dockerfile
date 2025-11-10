# syntax=docker/dockerfile:1.7-labs

# ---------- base ----------
  FROM node:20-bookworm-slim AS base
  WORKDIR /apps/web-marketplace
  RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
      && rm -rf /var/lib/apt/lists/*
  RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV CI=1
  
  # ---------- args to select the app ----------
  # Example: APP_PATH=apps/web-admin  PKG_NAME=@afribrok/web-admin
  ARG APP_PATH
  ARG PKG_NAME
  
  # ---------- deps ----------
  FROM base AS deps
  # monorepo manifests
  COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
  # copy shared packages manifests first (so filtered install can resolve them)
  # If you have multiple internal packages, copy their package.json files:
  COPY packages packages/
  # copy only the target app manifest
  COPY ${APP_PATH}/package.json ${APP_PATH}/
  
  # filtered install for the selected workspace
  RUN test -n "${PKG_NAME}" || (echo "PKG_NAME build arg is required" && exit 1)
  RUN pnpm -F ${PKG_NAME} install --frozen-lockfile
  
  # ---------- build ----------
  FROM deps AS build
  COPY . .
  WORKDIR /app/${APP_PATH}
  
  # keep build envs minimal and safe
  ENV DOCKER_BUILD=true
  ENV SKIP_ENV_VALIDATION=true
  ENV NODE_ENV=production
  ENV NEXT_TELEMETRY_DISABLED=1
  # If you build shared libs, do it here (adjust names as needed)
  # RUN pnpm -F @afribrok/lib build
  # RUN pnpm -F @afribrok/env build
  
  # Next.js build (no runtime envs required)
  RUN pnpm build
  
  # ---------- runtime (Next.js standalone) ----------
  FROM node:20-bookworm-slim AS runner
  ENV NODE_ENV=production
  ENV PORT=3000
  ENV HOSTNAME=0.0.0.0
  
  # Keep same app path at runtime so server.js path is stable
  ARG APP_PATH
  WORKDIR /app/${APP_PATH}
  
  # Copy standalone server and assets
  COPY --from=build /app/${APP_PATH}/.next/standalone ./
  COPY --from=build /app/${APP_PATH}/.next/static ./.next/static
  COPY --from=build /app/${APP_PATH}/public ./public
  
  EXPOSE 3000
  CMD ["node", "server.js"]