#!/usr/bin/env bash
set -euo pipefail

# ---------------------------
# AfriBrok local “real-world” test runner (no Docker image builds)
# - Boots infra with port exposure (temporary override)
# - Installs deps, builds libs, generates prisma, migrates, seeds
# - Starts core-api, media-service, web-admin, web-marketplace on PORT=3000
# - Runs smoke tests
# ---------------------------

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$ROOT_DIR/infrastructure/compose/docker-compose.prod.yml"
OVERRIDE_FILE="$ROOT_DIR/infrastructure/compose/docker-compose.local.override.yml"

# ---- 0) prerequisites ----
command -v docker >/dev/null || { echo "Docker is required"; exit 1; }
command -v docker compose >/dev/null || { echo "Docker Compose V2 is required"; exit 1; }
command -v pnpm >/dev/null || { echo "pnpm is required"; exit 1; }

# Pin pnpm for consistency
if ! grep -q '"packageManager": "pnpm@' "$ROOT_DIR/package.json"; then
  echo 'Adding "packageManager": "pnpm@8.15.0" to package.json'
  tmp="$(mktemp)"; jq '. + {"packageManager":"pnpm@8.15.0"}' "$ROOT_DIR/package.json" > "$tmp" && mv "$tmp" "$ROOT_DIR/package.json"
fi

# ---- 1) create local override (ports exposed for host) ----
mkdir -p "$(dirname "$OVERRIDE_FILE")"
cat > "$OVERRIDE_FILE" <<'YAML'
version: '3.8'
services:
  postgres:
    ports: ["5432:5432"]
  redis:
    ports: ["6379:6379"]
  keycloak:
    ports: ["8080:8080"]
YAML

echo "➡️  Starting infra (Postgres, Redis, Keycloak) with local port exposure…"
docker compose -f "$COMPOSE_FILE" -f "$OVERRIDE_FILE" up -d postgres redis keycloak

echo "⏳ Waiting for Postgres to be healthy…"
until docker compose -f "$COMPOSE_FILE" ps | grep postgres | grep -q "healthy"; do sleep 2; done

# ---- 2) env bootstrap for local apps ----
# Edit these once to match your local
export NEXT_PUBLIC_CORE_API_BASE_URL="${NEXT_PUBLIC_CORE_API_BASE_URL:-http://localhost:3000}"
export NEXT_PUBLIC_TENANT_KEY="${NEXT_PUBLIC_TENANT_KEY:-et-addis}"
export EXPO_PUBLIC_API_BASE_URL="${EXPO_PUBLIC_API_BASE_URL:-http://localhost:3000}"

# Core API runtime env for local (adjust as needed)
export DATABASE_URL="${DATABASE_URL:-postgresql://afribrok:${POSTGRES_PASSWORD:-password}@localhost:5432/afribrok}"
export REDIS_URL="${REDIS_URL:-redis://:${REDIS_PASSWORD:-password}@localhost:6379}"
export STORAGE_ENDPOINT="${STORAGE_ENDPOINT:-https://s3.amazonaws.com}"
export STORAGE_BUCKET="${STORAGE_BUCKET:-afribrok-local}"
export AWS_REGION="${AWS_REGION:-us-east-1}"
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-local-access-key}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-local-secret-key}"
export OIDC_ISSUER_URL="${OIDC_ISSUER_URL:-http://localhost:8080/realms/afribrok}"
export OIDC_CLIENT_ID="${OIDC_CLIENT_ID:-core-api}"
export OIDC_CLIENT_SECRET="${OIDC_CLIENT_SECRET:-secret}"
export TELEBIRR_SANDBOX_API_KEY="${TELEBIRR_SANDBOX_API_KEY:-dummy}"
export TELEBIRR_SANDBOX_SECRET="${TELEBIRR_SANDBOX_SECRET:-dummy}"

# ---- 3) workspace install & builds ----
echo "➡️  Installing workspace deps…"
pnpm install

echo "➡️  Building shared libs…"
pnpm --filter @afribrok/lib build || true
pnpm --filter @afribrok/config... build || true

echo "➡️  Prisma generate + migrate…"
pnpm --filter @afribrok/core-api exec prisma generate
pnpm --filter @afribrok/core-api exec prisma migrate deploy || pnpm --filter @afribrok/core-api exec prisma migrate dev
# optional seed (uncomment if you have a seed script configured):
# pnpm --filter @afribrok/core-api exec ts-node prisma/seed.ts || true

echo "➡️  Building services/apps…"
pnpm --filter @afribrok/core-api build
pnpm --filter @afribrok/media-service build
pnpm --filter @afribrok/web-admin build
pnpm --filter @afribrok/web-marketplace build

# ---- 4) run apps locally on port 3000 (each on its own terminal if you prefer) ----
echo "➡️  Starting core-api (PORT 3000)…"
PORT=3000 pnpm --filter @afribrok/core-api start:prod >/tmp/core-api.log 2>&1 & echo $! > /tmp/core-api.pid

echo "➡️  Starting media-service (PORT 3000, if separate port needed set here)…"
PORT=3001 pnpm --filter @afribrok/media-service start:prod >/tmp/media-service.log 2>&1 & echo $! > /tmp/media-service.pid

echo "➡️  Starting web-admin (Next standalone dev server)…"
PORT=3002 pnpm --filter @afribrok/web-admin start >/tmp/web-admin.log 2>&1 & echo $! > /tmp/web-admin.pid || true

echo "➡️  Starting web-marketplace (Next standalone dev server)…"
PORT=3003 pnpm --filter @afribrok/web-marketplace start >/tmp/web-marketplace.log 2>&1 & echo $! > /tmp/web-marketplace.pid || true

sleep 3

# ---- 5) smoke tests ----
echo "➡️  Running smoke tests…"
set +e
curl -fsS "http://localhost:3000/v1/health/live" && echo "core-api ✅" || echo "core-api ❌ (check /tmp/core-api.log)"
curl -fsS "http://localhost:3000/health" && echo "media-service ✅" || echo "media-service ❌ (check /tmp/media-service.log)"
curl -fsS "http://localhost:3002" >/dev/null && echo "web-admin ✅" || echo "web-admin ❌ (check /tmp/web-admin.log)"
curl -fsS "http://localhost:3003" >/dev/null && echo "web-marketplace ✅" || echo "web-marketplace ❌ (check /tmp/web-marketplace.log)"
set -e

cat <<MSG

✨ Local test up!

- core-api:        http://localhost:3000
- media-service:   http://localhost:3001
- web-admin:       http://localhost:3002
- marketplace:     http://localhost:3003
- Postgres:        localhost:5432 (user: afribrok / pass: ${POSTGRES_PASSWORD:-afribrok})
- Redis:           localhost:6379 (pass: ${REDIS_PASSWORD:-password})
- S3 bucket:       ${STORAGE_BUCKET} (region: ${AWS_REGION})
- Keycloak:        http://localhost:8080

Logs:
  tail -f /tmp/core-api.log
  tail -f /tmp/media-service.log
  tail -f /tmp/web-admin.log
  tail -f /tmp/web-marketplace.log

Stop apps:
  kill \$(cat /tmp/core-api.pid 2>/dev/null) 2>/dev/null || true
  kill \$(cat /tmp/media-service.pid 2>/dev/null) 2>/dev/null || true
  kill \$(cat /tmp/web-admin.pid 2>/dev/null) 2>/dev/null || true
  kill \$(cat /tmp/web-marketplace.pid 2>/dev/null) 2>/dev/null || true

Stop infra:
  docker compose -f "$COMPOSE_FILE" -f "$OVERRIDE_FILE" down

MSG
