# AfriBrok — Delivery Plan (Milestone 1 Boundaries)

## Product Posture
- White-label, multi-tenant registry and verified marketplace for AfriBrok.com.
- Pilot tenant: Ethiopia › Addis Ababa, expandable to city/sub-city sub-tenants.
- Roles surfaced at sign-in: Certified Broker, Real-Estate Agency, Individual Seller, Inspector, Admin/Regulator, Public viewer.
- Two pillars at launch: Broker licensing (registry, QR verification) and verified listings (rent/sale/land/commercial) with inquiry hand-off.

## Repository Layout (Milestone 1)
- `apps/web-admin`: Next.js dashboard for regulators and inspectors (KYC queue, approvals, QR issuance).
- `apps/web-marketplace`: Next.js public portal for search + broker verification landing.
- `apps/mobile-inspector`: Expo stub for offline enforcement (sync later).
- `services/core-api`: NestJS monolith (auth, tenancy, broker onboarding, listings).
- `services/media-service`: File validation + presigned URL broker; keep minimal.
- `packages/config`: `design-tokens/`, `env/`, and `tenants/` seed JSON.
- `packages/ui`: shadcn-based component library wired to tokens and theme switcher.
- `packages/lib`: Shared TypeScript utilities (api client, auth guard, form schemas).
- `infrastructure`: Docker compose, Terraform stubs, k8s manifests (only what we use).
- `docs/`: Specs, diagrams, process notes. No additional top-level folders without approval.

## Milestone 1 Objectives (Weeks 1–3)
- Tenant core: registry CRUD, domain/header resolution, Postgres RLS enforcement.
- Auth: OIDC integration, role claims mapping, MFA-ready scaffolding, role selection UI.
- Broker onboarding MVP: ID/license uploads, selfie placeholder, submit→review pipeline.
- Admin tooling: review queue, approve/deny/suspend, QR package (print-ready + public page).
- Marketplace foundation: verified listing cards, inquiry CTA (email stub), fraud duplicate checks queued.
- Theming: tenant-aware tokens (colors, typography, spacing) flowing through all apps.
- Payments sandbox: adapter contract with Telebirr stub (no real charge).

## Non-Goals (Remain Out for M1)
- Escrow, e-contracts, tax, analytics dashboards, AI enforcement beyond duplicate stubs.
- Production USSD/SMS, native mobile release, payment settlements.
- Multi-region infra automation beyond single environment Terraform skeleton.

## Definition of Done
- End-to-end: Certified Broker can onboard, regulator approves, QR verification page available to public, Individual Seller can post via verified broker or self (flagged for manual review).
- Role-based access enforced; tenancy isolation covered by automated tests.
- CI pipeline runs lint, type-check, unit tests, Docker builds for `web-admin`, `web-marketplace`, `core-api`.
- Design tokens applied in both web apps, matching theme spec, responsive on desktop/tablet.
- Local dev via `pnpm dev` brings up stack (Next.js apps, Nest API, Postgres, Redis, Keycloak; object storage points to S3).

## UI Theme & Brand Guardrails
- Color tokens:
  - Primary: `#184C8C` (Trust Blue) — navigation, primary actions.
  - Secondary: `#0F9D58` (Verification Green) — success, status pills.
  - Accent: `#F9A825` (Sunrise Gold) — highlights, CTA badges.
  - Neutral: `#0F172A`, `#1E293B`, `#334155`, `#CBD5F5`, `#E2E8F0`, `#F8FAFC`.
  - Danger: `#D93025`.
- Typography: Inter (fallback system fonts), weights 400/500/600; generous white space, rounded corners `lg`.
- Layout: light-weight backgrounds, high contrast text, minimal gradients; focus on clarity for regulators.

## Risks & Mitigations
- KYC provider TBD → mock adapter + feature flag to swap provider.
- Payments rail TBD → interface-first design with stub and contract tests.
- Multi-tenant complexity → shared migrations verified per tenant fixture, seed provides Ethiopia/Addis defaults.
- Over-engineering risk → all new folders require update to this plan; stick to single API service and shared packages listed above.
