# Local Infrastructure (Docker Compose)

Defines the Milestone 1 local stack:
- PostgreSQL 15 + PostGIS (with RLS enabled).
- Redis 7.
- Keycloak (OIDC provider).
- Optional: Mailhog (email stub), LocalStack (future AWS mocks for S3).

Tasks:
1. Create `docker-compose.yml` with services above, volumes, and seeded databases. S3 runs as an external dependency (configure credentials via environment variables).
2. Provide `.env.example` documenting credentials and ports.
3. Add helper script (`pnpm infra:up`) once monorepo scripts are wired.
4. Ensure migration + seed commands run automatically on first boot.
