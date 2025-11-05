# ---- base: install pnpm and set up environment -------------------------------
  FROM node:20-alpine AS base
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  WORKDIR /app
  
  # ---- deps: install all workspaces (dev + prod) -------------------------------
  FROM base AS deps
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  COPY packages/config/env/package.json ./packages/config/env/
  COPY services/media-service/package.json ./services/media-service/
  RUN pnpm install --frozen-lockfile
  
  # ---- build: compile code -----------------------------------------------------
  FROM deps AS build
  COPY . .
  RUN pnpm --filter @afribrok/config... build || true
  RUN pnpm --filter @afribrok/media-service build
  
  # ---- runtime: copy only what we need ----------------------------------------
  FROM node:20-alpine AS production
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=3000
  
  # Install pnpm for production dependencies
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  
  # Copy package files for dependency installation
  COPY --from=build /app/package.json ./package.json
  COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
  COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
  COPY --from=build /app/services/media-service/package.json ./package.json
  
  # Copy built application
  COPY --from=build /app/services/media-service/dist ./dist
  COPY --from=build /app/packages ./packages
  
  # Install only production dependencies
  RUN pnpm install --prod --no-frozen-lockfile || true
  
  EXPOSE 3000
  
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["node", "dist/main.js"]