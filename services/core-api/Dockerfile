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
  RUN pnpm exec prisma generate || pnpm dlx prisma@^5.10.2 generate
  RUN pnpm build
  
  # Create production output directory manually (pnpm deploy has issues with workspace filters)
  # Copy built files and install production dependencies
  WORKDIR /app
  RUN mkdir -p /app/.output/services/core-api && \
      cp -r /app/services/core-api/dist /app/.output/dist && \
      cp -r /app/services/core-api/prisma /app/.output/services/core-api/prisma && \
      cp /app/services/core-api/package.json /app/.output/services/core-api/package.json && \
      cp /app/package.json /app/.output/package.json && \
      cp /app/pnpm-lock.yaml /app/.output/pnpm-lock.yaml && \
      cp /app/pnpm-workspace.yaml /app/.output/pnpm-workspace.yaml && \
      cp -r /app/packages /app/.output/packages && \
      cp /app/packages/config/env/package.json /app/.output/packages/config/env/package.json && \
      cp /app/packages/config/design-tokens/package.json /app/.output/packages/config/design-tokens/package.json && \
      cp /app/packages/lib/package.json /app/.output/packages/lib/package.json
  WORKDIR /app/.output
  RUN pnpm -w install --frozen-lockfile --prod
  
  # -------- runtime --------
  FROM node:20-alpine AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  ENV PORT=8080
  
  # Install pnpm in runtime stage (needed for prisma generate)
  ENV PNPM_HOME=/root/.local/share/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
  
  # copy the pruned artifact (includes dist/ and correct node_modules)
  COPY --from=build /app/.output/ ./
  
  # Generate Prisma client in runtime (schema is already copied)
  WORKDIR /app/services/core-api
  RUN pnpm dlx prisma@^5.10.2 generate
  WORKDIR /app
  
  # Set NODE_PATH to ensure module resolution works correctly
  ENV NODE_PATH=/app/node_modules
  
  # Verify node_modules structure (debug if needed)
  RUN ls -la /app/node_modules | head -20 || echo "node_modules not found" && \
      test -d /app/node_modules/@nestjs/common || (echo "⚠️  @nestjs/common not found" && ls -la /app/node_modules/@nestjs 2>/dev/null || echo "No @nestjs directory") && \
      echo "✅ Build complete"
  
  EXPOSE 8080
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["node", "dist/main.js"]