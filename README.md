# AfriBrok Monorepo (Milestone 1 Skeleton)

> White-label, multi-tenant broker registry and verified marketplace for AfriBrok.com.

## Structure

- `apps/` — user-facing experiences.
  - `web-admin/` — regulator & inspector dashboard (Next.js).
  - `web-marketplace/` — public marketplace + role-based onboarding (Next.js).
  - `mobile-inspector/` — Expo stub for street enforcement and offline sync.
- `services/` — backend API and supporting services.
  - `core-api/` — NestJS monolith (auth, tenancy, registry, listings).
  - `media-service/` — upload validation + presigned URL broker.
- `packages/` — shared configuration and libraries.
  - `config/` — env schema, design tokens, tenant metadata.
  - `ui/` — shadcn/Tailwind component kit bound to design tokens.
  - `lib/` — shared utilities (API client, auth helpers, form schemas).
- `infrastructure/`
  - `compose/` — docker-compose stack for local dev (Postgres, Redis, MinIO, Keycloak).
  - `iac/` — Terraform/Kubernetes scaffolding (single-env skeleton for M1).
- `docs/` — specifications, guides, diagrams.

## Quick Start (Development)

```bash
# Install dependencies
pnpm install

# Start infrastructure (Postgres, Redis, MinIO, Keycloak)
pnpm infra:up

# Run database migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed

# Start all applications
pnpm dev
```

## 🚀 Production Deployment

### Ready for Production!

The project is now configured for production deployment with:

- ✅ **Dockerfiles** for all services and applications
- ✅ **Production docker-compose.yml** configuration
- ✅ **CI/CD Pipeline** (GitHub Actions)
- ✅ **Deployment Scripts** and automation
- ✅ **Production Deployment Guide**

### Quick Production Deployment

1. **Configure Environment Variables**
   ```bash
   cp infrastructure/compose/.env.production.example infrastructure/compose/.env.production
   # Edit .env.production with your production values
   ```

2. **Deploy**
   ```bash
   ./scripts/deploy.sh production
   ```

3. **Verify Deployment**
   ```bash
   curl http://localhost:4000/v1/health/ready
   ```

### 📚 Production Documentation

- **[Production Deployment Guide](docs/PRODUCTION-DEPLOYMENT.md)** - Complete deployment instructions
- **[Next Steps for Production](docs/NEXT-STEPS-PRODUCTION.md)** - Step-by-step deployment guide
- **[Production Readiness Checklist](docs/PRODUCTION-READINESS-CHECKLIST.md)** - Pre-deployment checklist

### Deployment Options

1. **Docker Compose** (Single Server) - See `infrastructure/compose/docker-compose.prod.yml`
2. **Cloud PaaS** - Deploy to Vercel, Railway, or Render
3. **Kubernetes** - Kubernetes manifests (coming soon)

### 🔒 Security Checklist

Before deploying to production, review: `docs/PRODUCTION-READINESS-CHECKLIST.md`

## Development Next Steps

1. Populate each app/service with scaffolding using `pnpm` + Turborepo.
2. Configure Tailwind configs to consume `@afribrok/design-tokens`.
3. Implement tenancy-aware env schema and database migrations (`services/core-api`).
4. Translate wireframes into Figma and align with stakeholders before UI build.

See `docs/specs/plan.md`, `docs/specs/spec.md`, and `docs/specs/task.md` for authoritative scope. This repo intentionally avoids extra abstractions beyond Milestone 1.
# Africabrokers
