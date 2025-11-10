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
COPY packages packages/
COPY apps/web-admin/package.json apps/web-admin/
# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM deps AS build
COPY . .
# Build workspace packages first
WORKDIR /app
ENV DOCKER_BUILD=true
ENV SKIP_ENV_VALIDATION=true
ENV NODE_ENV=production
# Set required env vars for build (use placeholder values if not provided)
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
# Limit Node.js memory to prevent Jest worker errors
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm -F @afribrok/lib build
RUN pnpm -F @afribrok/env build
# Build web-admin
WORKDIR /app/apps/web-admin
# Create public directory if it doesn't exist (Next.js requires it)
RUN mkdir -p public
# Build with limited concurrency to avoid worker errors
RUN pnpm build

# ---------- runtime ----------
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
# Copy standalone output from Next.js build (includes server.js and all required node_modules)
COPY --from=build /app/apps/web-admin/.next/standalone ./
# Copy static files to the correct location
COPY --from=build /app/apps/web-admin/.next/static ./apps/web-admin/.next/static
# Copy public directory
COPY --from=build /app/apps/web-admin/public ./apps/web-admin/public
# Set working directory to the app location
WORKDIR /app/apps/web-admin
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Run the standalone server
CMD ["node", "server.js"]
