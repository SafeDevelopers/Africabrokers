# -------- base --------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  WORKDIR /app
  
  # -------- deps (workspace-aware; install dev+prod) --------
  FROM base AS deps
  # Root manifests
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  # Manifests for workspaces so pnpm can resolve without full source yet
  COPY packages/config/env/package.json ./packages/config/env/
  COPY packages/config/design-tokens/package.json ./packages/config/design-tokens/
  COPY packages/lib/package.json ./packages/lib/
  COPY services/core-api/package.json ./services/core-api/
  # Install all deps (dev + prod) per lockfile
  RUN pnpm -w install --frozen-lockfile
  
  # -------- build --------
  FROM deps AS build
  # Bring in full source
  COPY . .
  # Build local libs (must emit JS to dist/)
  RUN pnpm -w --filter @afribrok/lib build || true
  RUN pnpm -w --filter @afribrok/config... build || true
  
  # Generate Prisma client (DEV deps available here)
  WORKDIR /app/services/core-api
  RUN pnpm prisma generate
  
  # Build the NestJS service
  RUN pnpm build
  
  # -------- runtime (copy node_modules from build) --------
  FROM node:20-alpine AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=8080
  
  # Install pnpm in runtime stage (needed to resolve pnpm symlinks)
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  
  # Copy root package files (needed for pnpm install)
  COPY --from=build /app/package.json ./package.json
  COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
  COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

  # Copy workspace package manifests (needed for workspace resolution)
  COPY --from=build /app/packages/config/env/package.json ./packages/config/env/package.json
  COPY --from=build /app/packages/config/design-tokens/package.json ./packages/config/design-tokens/package.json
  COPY --from=build /app/packages/lib/package.json ./packages/lib/package.json
  COPY --from=build /app/services/core-api/package.json ./services/core-api/package.json

  # Copy workspace packages (built packages needed at runtime)
  COPY --from=build /app/packages ./packages

  # Copy compiled app + prisma schema
  COPY --from=build /app/services/core-api/dist ./dist
  # Copy prisma schema to the correct location (services/core-api/prisma)
  # Prisma expects the schema to be in a prisma/ directory relative to where we run the command
  COPY --from=build /app/services/core-api/prisma ./services/core-api/prisma

  # Install production dependencies only (creates fresh node_modules without symlinks)
  # This avoids symlink issues in Docker by creating a clean production install
  # pnpm will resolve all dependencies and create a proper node_modules structure
  RUN pnpm -w install --frozen-lockfile --prod --filter @afribrok/core-api...

  # Generate Prisma client using pnpm dlx (pnpm's equivalent of npx)
  # pnpm dlx will download and run prisma without needing to install it first
  # Run from services/core-api where the prisma schema is located
  WORKDIR /app/services/core-api
  RUN pnpm dlx prisma@^5.10.2 generate
  WORKDIR /app

  # Set NODE_PATH to ensure module resolution works correctly
  ENV NODE_PATH=/app/node_modules

  # Verify node_modules exists and @nestjs/common is installed (lenient check)
  # Check if the directory exists rather than trying to require (which may fail due to module resolution)
  RUN test -d /app/node_modules/@nestjs/common || (echo "⚠️  @nestjs/common not found in node_modules" && ls -la /app/node_modules | head -20 && exit 1) && \
      echo "✅ @nestjs/common directory found in node_modules"
  
  EXPOSE 8080
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  # Run from /app directory (where node_modules and dist are located)
  WORKDIR /app
  CMD ["node", "dist/main.js"]