# AfriBrok — Technical Spec (Milestone 1)

## System Architecture
- Monorepo: Turborepo + pnpm workspaces.
- Client apps: `apps/web-admin` & `apps/web-marketplace` (Next.js 14 App Router), `apps/mobile-inspector` (Expo/React Native stub with offline cache mock).
- API: `services/core-api` (NestJS) exposes REST + GraphQL (optional) behind single gateway; background jobs via BullMQ in same service.
- Media: `services/media-service` (NestJS lightweight) handles upload validation, presigned URLs, file type scanning (stub for AV).
- Data layer: PostgreSQL 15 + PostGIS; Redis 7 for cache/queues; MinIO for object storage dev.
- Observability: OpenTelemetry tracing, structured JSON logs, health endpoints.

## Repository Modules
- `packages/config/design-tokens`: JSON tokens (colors, typography, spacing, radii) consumed by Tailwind + shadcn theme.
- `packages/config/env`: zod schemas, default env loader, tenant seeds.
- `packages/lib/api-client`: cross-app API SDK (OpenAPI generated later, manual TS interfaces now).
- `packages/lib/auth`: role guard helpers, tenancy context, cookie/session utilities.
- `packages/ui`: Base layout, nav, buttons, cards, status components, form wrappers; all using design tokens.
- `infrastructure/compose`: docker-compose.yml, .env.example, seed scripts.
- `infrastructure/iac`: Terraform skeleton for later deployment (S3 bucket, RDS, ECS/EKS stub—no provisioning in M1).

## Tenancy & Security
- Tenant resolution: domain → tenant in middleware, fallback to `x-tenant-id` header for admin tooling.
- Database session sets `SET app.tenant_id = '<tenant_uuid>'`; Postgres RLS policies on tenant-scoped tables.
- Request guards ensure role is within tenant's allowed set; failing returns 403.
- JWT issued by external OIDC (Keycloak/Authentik) contains `tenant_id`, `role`, `sub`. We map to internal user or reject.
- Sensitive fields (phone, email, national_id_hash) encrypted at rest via pgcrypto; stored hashed for lookup.
- Audit table captures: actor (user_id), tenant_id, entity, action, before/after JSONB, IP, user_agent.
- No PII in logs; structured logs redacting sensitive fields. Secrets loaded only from validated env schema.

## Data Model (M1 scope)
- `tenants(id, key, name, domain, brand_config_json, locales, currency, payment_config_json, active)`
- `users(id, tenant_id, auth_provider_id, role ENUM['certified_broker','agency','individual_seller','inspector','regulator','admin','public'], phone_hash, email_hash, national_id_hash, kyc_status, mfa_enabled, created_at)`
- `brokers(id, tenant_id, user_id, license_number, license_docs_json, business_docs_json, status ENUM['draft','submitted','approved','suspended','revoked'], qr_code_id, rating, strike_count, submitted_at, approved_at)`
- `properties(id, tenant_id, owner_user_id, broker_id, type ENUM['residential','commercial','land'], address_json, geo geography(Point,4326), ownership_proof_url, verification_status ENUM['draft','pending','verified','rejected'], created_at)`
- `listings(id, tenant_id, property_id, price_amount, price_currency, availability_status ENUM['active','pending_review','suspended','closed'], channels_json, featured_boolean, fraud_score, published_at)`
- `kyc_reviews(id, tenant_id, broker_id, reviewer_id, decision ENUM['pending','approved','denied','needs_more_info'], notes, decided_at)`
- `complaints(id, tenant_id, target_type ENUM['broker','listing'], target_id, reporter_user_id, category, severity, status ENUM['open','investigating','resolved','dismissed'], resolution_notes, created_at)`
- `qr_codes(id, tenant_id, broker_id, qr_svg_url, status, last_reprinted_at)`
- `payments(id, tenant_id, payer_user_id, purpose ENUM['registration','renewal','listing_fee','fine'], amount, currency, provider_key, reference, status ENUM['pending','succeeded','failed','refunded'], created_at)`
- `audit_logs(id, tenant_id, actor_user_id, entity, entity_id, action, before_state, after_state, ip_address, user_agent, created_at)`

## API Surface (M1)
- Auth
  - `POST /v1/auth/callback` — exchange OIDC code, create session, enforce role selection.
  - `POST /v1/auth/select-role` — user chooses Certified Broker / Real-Estate Agency / Individual Seller; persists preference.
- Brokers
  - `POST /v1/brokers` — create broker draft, returns upload slots.
  - `POST /v1/brokers/{id}/documents` — request presigned URLs from media-service (license, ID, selfie).
  - `POST /v1/brokers/{id}/submit` — move to review queue; enqueue duplicate/background checks.
  - `GET /v1/brokers/{id}` — detail view for owner.
- Reviews & Enforcement
  - `GET /v1/reviews/pending` — paginated queue for regulators.
  - `POST /v1/reviews/{id}/decision` — approve/deny/suspend; triggers QR issuance on approve.
  - `POST /v1/enforcement/strikes` — inspector issues strike or suspension (stub).
- QR Verification
  - `GET /v1/verify/{qr_code}` — public page data (tenant-agnostic).
- Marketplace
  - `POST /v1/listings` — create listing (requires verified broker or individual flagged for manual check).
  - `GET /v1/listings/search` — filters by price, district, property type, availability.
  - `POST /v1/listings/{id}/inquiry` — capture lead, send email (stub).
- Complaints
  - `POST /v1/complaints` — submit complaint (Broker or Listing).
  - `PATCH /v1/complaints/{id}` — reviewer updates status.
- Payments
  - `POST /v1/payments/checkout` — initiate sandbox payment (Telebirr mock).
  - `POST /v1/payments/webhook` — process fake gateway callback.

## Frontend Specification
- Shared layout uses light neutral background (#F8FAFC) with accent border highlights in brand colors.
- Role selection screen displayed immediately post-auth with segmented cards for Certified Broker, Real-Estate Agency, Individual Seller; storing selection in user profile and local state.
- `apps/web-admin`:
  - Dashboard landing: metrics (pending reviews, active brokers, open complaints).
  - KYC queue: table with filters (tenant, status), approve/deny modals.
  - QR issuance: detail page with printable pack (SVG + instructions).
  - Complaints triage: list + detail view.
- `apps/web-marketplace`:
  - Home hero with tenant-specific branding (logo, tagline).
  - Search bar, listing grid (card uses primary/neutral tokens).
  - Broker verification lookup form (QR code input).
  - Listing detail page with contact CTA (email stub).
- `apps/mobile-inspector`:
  - Offline storage stub (AsyncStorage); ability to scan QR (mock), view broker status, issue warning (stored locally).

## Theming & Brand Implementation
- Design tokens defined in `packages/config/design-tokens/{tenant}.json`.
- Tailwind config pulls tokens via preset; use CSS variables on `html` per tenant.
- Theme fields: `primary`, `secondary`, `accent`, `neutral.{50,100,200,400,600,800}`, `danger`, `success`, `info`.
- Logo placeholder stored per tenant in S3/minio; fallback to AfriBrok.com logotype.
- Typography: Inter; fallback to `system-ui`; text sizes aligned to 4px scale.

## Integrations & Adapters
- `IdentityProviderAdapter`: wraps OIDC config; M1 uses Keycloak dev realm.
- `PaymentGatewayAdapter`: Telebirr mock provider returning deterministic success/failure.
- `DocumentVerificationAdapter`: stub storing metadata; interface ready for OCR provider.
- `MessagingAdapter`: stub to log email/SMS payloads (no external send).

## Testing Strategy
- Unit tests: tenancy guard, role guard, broker submission use cases, review decision state transitions.
- Integration tests: API endpoints with supertest + Postgres test schema per tenant fixture.
- Frontend: Playwright smoke tests for role select, broker onboarding journey, admin approval flow.
- Contract tests for adapters to ensure Telebirr mock consistent across services.
- Seed data: `pnpm db:seed` loads Ethiopia/Addis tenant, default regulator/admin accounts, sample verified broker.

## Observability & Ops
- Health checks at `/health/live` and `/health/ready`.
- Structured logging via Pino transport; log trace ID from OpenTelemetry.
- Metrics: request duration, queue depth, review decision counts (Prometheus endpoint).
- Feature flags (simple JSON) stored in `packages/config/tenant-flags.json`; no external FF service in M1.
