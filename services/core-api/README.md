# Core API Service

NestJS monolith providing authentication, tenancy enforcement, broker onboarding, listings, complaints, and payments stubs for AfriBrok Milestone 1.

Planned modules:
- `AuthModule` — OIDC integration, JWT verification, role selection.
- `TenancyModule` — domain/header resolution, Postgres RLS session setter.
- `UsersModule` — user profiles, role metadata.
- `BrokersModule` — onboarding workflow, document submission, review queue.
- `ListingsModule` — property + listing CRUD with verification rules.
- `ComplaintsModule` — complaint intake and resolution.
- `PaymentsModule` — Telebirr sandbox adapter (stub).
- `AuditModule` — consistent audit logging decorator.

Setup tasks: configure `pnpm` workspace, environment schema (see `packages/config/env`), database migrations, and BullMQ worker stubs.

## Local Testing Environment Variables

For local testing, create a `.env` file in this directory with at minimum:

```bash
# Required for local testing
PORT=8080
DATABASE_URL=postgresql://afribrok:afribrok@localhost:5432/afribrok?sslmode=disable

# Additional required variables
NODE_ENV=development
REDIS_URL=redis://:password@localhost:6379/0
JWT_ISSUER=http://localhost:8080/dev-issuer
JWT_AUDIENCE=afribrok-api
OIDC_ISSUER=http://localhost:8080/dev-issuer
OIDC_ISSUER_URL=http://localhost:8080/dev-issuer
OIDC_CLIENT_ID=local-client
OIDC_CLIENT_SECRET=local-secret
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8081
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=local-media
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local-secret
TELEBIRR_SANDBOX_API_KEY=sandbox-key
TELEBIRR_SANDBOX_SECRET=sandbox-secret
```

**Prerequisites for local testing:**
1. Start PostgreSQL and Redis via infrastructure compose:
   ```bash
   cd ../../infrastructure/compose
   docker compose -f docker-compose.prod.yml up -d postgres redis
   ```

2. Run migrations:
   ```bash
   pnpm exec prisma migrate dev
   ```

3. Start the API:
   ```bash
   pnpm run start:prod
   ```
