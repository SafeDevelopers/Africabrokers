# -------- base --------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  WORKDIR /repo
  
  # -------- deps --------
  FROM base AS deps
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  COPY packages/config/env/package.json ./packages/config/env/
  COPY services/media-service/package.json ./services/media-service/
  RUN pnpm -w install --frozen-lockfile
  
  # -------- build --------
  FROM deps AS build
  COPY . .
  # Build shared packages first (may not have build scripts)
  RUN pnpm -w --filter @afribrok/config... build || true
  # Build only the media-service (not its dependencies to avoid turbo issues)
  WORKDIR /repo/services/media-service
  RUN pnpm build
 
  
  # -------- deploy --------
  FROM build AS deploy
  WORKDIR /repo
  RUN pnpm -w deploy --filter @afribrok/media-service /out
  
  # -------- runtime --------
  FROM node:20-alpine AS runtime
  ENV NODE_ENV=production
  ENV PORT=3000
  WORKDIR /app
  # Copy built application and dependencies
  COPY --from=build /repo/services/media-service/dist ./dist
  COPY --from=build /repo/services/media-service/package.json ./package.json
  COPY --from=build /repo/node_modules ./node_modules
  COPY --from=build /repo/packages ./packages
  
  EXPOSE 3000
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["node", "dist/main.js"]