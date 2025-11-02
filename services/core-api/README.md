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
