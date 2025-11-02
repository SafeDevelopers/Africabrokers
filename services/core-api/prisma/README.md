# Prisma Setup

This schema encodes the Milestone 1 data model (tenants, users, brokers, listings, complaints, payments, audit logs).

## Commands

```bash
pnpm --filter @afribrok/core-api prisma:generate
pnpm --filter @afribrok/core-api prisma:migrate --name init
```

> Migrations will fail until PostgreSQL is available via `infrastructure/compose` and the `DATABASE_URL` matches the credentials in `.env`.

## Notes
-	`geo` uses Postgres `geography(Point, 4326)` via Prisma's `Unsupported` type. Add PostGIS to the database before running migrations.
-	All tenant-scoped tables include `tenantId`; enforce Row Level Security in the database migrations after creating the schema.
-	Sensitive fields (`phoneHash`, `emailHash`, `nationalIdHash`) should be persisted as hashed values—ensure hashing occurs in the service layer before writes.
