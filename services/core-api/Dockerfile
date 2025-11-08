# -------- build --------
  FROM node:20-alpine AS build
  WORKDIR /app
  
  # pnpm
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  
  # workspace manifests (cache)
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  COPY packages/config/env/package.json ./packages/config/env/
  COPY packages/config/design-tokens/package.json ./packages/config/design-tokens/
  COPY packages/lib/package.json ./packages/lib/
  COPY services/core-api/package.json ./services/core-api/
  
  RUN pnpm -w install --frozen-lockfile
  
  # bring source and build
  COPY . .
  RUN pnpm -w --filter @afribrok/lib build || true
  RUN pnpm -w --filter @afribrok/config... build || true
  
  # prisma + build
  WORKDIR /app/services/core-api
  RUN pnpm prisma generate
  RUN pnpm build
  
  # >>> RUN DEPLOY FROM INSIDE THE SERVICE (unambiguous; matches exactly one project)
  RUN pnpm deploy --prod /app/.output
  
  # -------- runtime --------
  FROM node:20-alpine AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=8080
  
  # copy the pruned artifact (includes dist/ and correct node_modules)
  COPY --from=build /app/.output/ ./
  
  # fail the build early if Nest isn't present
  RUN node -e "console.log(require.resolve('@nestjs/common'))"
  
  EXPOSE 8080
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["node", "dist/main.js"]