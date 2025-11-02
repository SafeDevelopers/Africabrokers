# AfriBrok — Execution Tasks (Milestone 1)

## Priority 0 — Must Ship
1. **Monorepo Bootstrap**
   - Initialize Turborepo + pnpm workspaces with structure from plan (`apps/`, `services/`, `packages/`, `infrastructure/`, `docs/`).
   - Add root scripts `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
   - Provide `.editorconfig`, `.prettierrc`, `.eslintrc` aligned with strict TS.
2. **Environment & Tooling**
   - `infrastructure/compose`: docker-compose with Postgres (RLS ready), Redis, MinIO, Keycloak.
   - Seed script for tenants (`Ethiopia/Addis`) and default admin/broker.
   - Document local setup in `docs/README-dev.md`.
3. **Design Tokens & UI Kit**
   - Define color/typography/spacing tokens per plan in `packages/config/design-tokens/default.json` and tenant override.
  - Configure Tailwind + shadcn in `packages/ui`; ensure tokens propagate to `apps/web-admin` and `apps/web-marketplace`.
4. **Auth & Tenancy Foundation**
   - `services/core-api`: NestJS app with modules for auth, tenancy, users.
   - Middleware sets `app.tenant_id`; apply RLS migrations and policies.
   - OIDC integration (Keycloak) + `/auth/callback`, `/auth/select-role`.
5. **Broker Onboarding Flow**
   - Entities: users, brokers with status transitions.
   - Endpoints for broker draft creation, document upload via media-service, submit.
   - Queue stub for duplicate/fraud check (BullMQ job writes audit log).
6. **Review & QR Issuance**
   - Admin endpoints: pending reviews list, decision API, QR generation (SVG) stored in MinIO.
   - Public verify endpoint + Next.js page in `apps/web-marketplace` using theme.
7. **Marketplace Listings MVP**
   - Property + listing models, create/list APIs with verification rules.
   - Marketplace UI: search result list, listing detail, inquiry stub (email log).
   - Individual seller listing path flagged for manual review badge.
8. **Complaints & Audit Trail**
   - Complaint submission API + admin triage UI (status changes).
   - Audit logging decorator capturing all status transitions.
9. **CI / Quality Gate**
   - GitHub Actions or local CI script running lint, typecheck, tests, Docker builds for `apps/web-admin`, `apps/web-marketplace`, `services/core-api`.
   - Minimum unit tests for tenancy guard, broker submission flow, review decision.

## Priority 1 — Nice-to-Have (If Time Allows)
10. **OCR/Dedupe Worker Stub**
    - Background job template storing dedupe results; surface warnings in review UI.
11. **Inspector Mobile Stub**
    - Expo screen for QR scan mock, offline storage, strike issuance (sync later).
12. **Metrics & Dashboard Enhancements**
    - Prometheus metrics endpoint, admin dashboard cards (pending reviews, strikes).

## Commands & Acceptance
- `pnpm dev` → starts all M1 services (web-admin, web-marketplace, mobile stub, core-api, media-service, infra deps).
- `pnpm lint` / `pnpm typecheck` / `pnpm test` must pass before merge.
- `pnpm db:migrate` + `pnpm db:seed` prepare dev database with tenant + sample data.
- Smoke test script (`pnpm test:e2e`) covers broker submission → approval → verify page.

## Definition of Ready
- Each task references relevant section in `docs/specs/spec.md`.
- Acceptance criteria enumerated, env vars listed in `packages/config/env/README.md`.
- UX mock or wireframe (Figma/link) attached for UI-centric tasks before implementation.
