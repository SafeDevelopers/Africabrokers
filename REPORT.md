# QA Compliance & Routing REPORT

## Routes & Guards
- [x] All application and API route files enumerated with inferred URLs and guard sources.

### Web Admin – Tenant Admin / Agent stack (`apps/web-admin/app/(tenant)`)
| URL | File | Guard / Notes |
| --- | --- | --- |
| `/` | `apps/web-admin/app/(tenant)/page.tsx:1` | Rendered inside tenant layout that enforces TENANT_ADMIN/AGENT role with tenant context (see `apps/web-admin/app/(tenant)/layout.tsx:1`). |
| `/settings` | `apps/web-admin/app/(tenant)/settings/page.tsx:1` | Tenant layout guard as above. |
| `/settings/services` | `apps/web-admin/app/(tenant)/settings/services/page.tsx:1` | Tenant layout guard; also runs service status checks. |
| `/brokers` | `apps/web-admin/app/(tenant)/brokers/page.tsx:1` | Tenant layout guard; broker management view. |
| `/brokers/verification` | `apps/web-admin/app/(tenant)/brokers/verification/page.tsx:1` | Tenant layout guard. |
| `/brokers/:id` | `apps/web-admin/app/(tenant)/brokers/[id]/page.tsx:1` | Tenant layout guard. |
| `/brokers/pending` | `apps/web-admin/app/(tenant)/brokers/pending/page.tsx:1` | Tenant layout guard. |
| `/qr-codes` | `apps/web-admin/app/(tenant)/qr-codes/page.tsx:1` | Tenant layout guard; uses QR admin tooling. |
| `/qr-codes/:id` | `apps/web-admin/app/(tenant)/qr-codes/[id]/page.tsx:1` | Tenant layout guard; server-rendered SVG. |
| `/activity` | `apps/web-admin/app/(tenant)/activity/page.tsx:1` | Tenant layout guard. |
| `/health` | `apps/web-admin/app/(tenant)/health/page.tsx:1` | Tenant layout guard; polls backend health endpoint. |
| `/listings` | `apps/web-admin/app/(tenant)/listings/page.tsx:1` | Tenant layout guard. |
| `/listings/reported` | `apps/web-admin/app/(tenant)/listings/reported/page.tsx:1` | Tenant layout guard. |
| `/listings/featured` | `apps/web-admin/app/(tenant)/listings/featured/page.tsx:1` | Tenant layout guard. |
| `/listings/:id` | `apps/web-admin/app/(tenant)/listings/[id]/page.tsx:1` | Tenant layout guard. |
| `/listings/pending` | `apps/web-admin/app/(tenant)/listings/pending/page.tsx:1` | Tenant layout guard. |
| `/verifications/pending` | `apps/web-admin/app/(tenant)/verifications/pending/page.tsx:1` | Tenant layout guard. |
| `/users` | `apps/web-admin/app/(tenant)/users/page.tsx:1` | Tenant layout guard. |
| `/payouts/pending` | `apps/web-admin/app/(tenant)/payouts/pending/page.tsx:1` | Tenant layout guard. |
| `/billing/invoices` | `apps/web-admin/app/(tenant)/billing/invoices/page.tsx:1` | Tenant layout guard. |
| `/billing/plans` | `apps/web-admin/app/(tenant)/billing/plans/page.tsx:1` | Tenant layout guard. |
| `/billing/payment-methods` | `apps/web-admin/app/(tenant)/billing/payment-methods/page.tsx:1` | Tenant layout guard. |
| `/reports` | `apps/web-admin/app/(tenant)/reports/page.tsx:1` | Tenant layout guard. |
| `/reviews` | `apps/web-admin/app/(tenant)/reviews/page.tsx:1` | Tenant layout guard. |
| `/reviews/compliance` | `apps/web-admin/app/(tenant)/reviews/compliance/page.tsx:1` | Tenant layout guard. |
| `/reviews/compliance/:id` | `apps/web-admin/app/(tenant)/reviews/compliance/[id]/page.tsx:1` | Tenant layout guard. |
| `/reviews/audit` | `apps/web-admin/app/(tenant)/reviews/audit/page.tsx:1` | Tenant layout guard. |
| `/reviews/:id` | `apps/web-admin/app/(tenant)/reviews/[id]/page.tsx:1` | Tenant layout guard. |
| `/reviews/pending` | `apps/web-admin/app/(tenant)/reviews/pending/page.tsx:1` | Tenant layout guard. |
| `/reports` | `apps/web-admin/app/(tenant)/reports/page.tsx:1` | Tenant layout guard. |
| `/qr-codes/:id/actions` | `apps/web-admin/app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:1` | Client widget still inside tenant auth context. |

### Web Admin – Super Admin stack (`apps/web-admin/app/super*`)
| URL | File | Guard / Notes |
| --- | --- | --- |
| `/superadmin/dashboard` | `apps/web-admin/app/superadmin/dashboard/page.tsx:1` | Redirects to `/super`; actual guard handled by `/super` layout. |
| `/super` | `apps/web-admin/app/super/page.tsx:1` | Wrapped by `apps/web-admin/app/super/layout.tsx:1`, which redirects non-SUPER_ADMIN users. |
| `/super/settings` | `apps/web-admin/app/super/settings/page.tsx:1` | Same SUPER_ADMIN-only layout. |
| `/super/agents` | `apps/web-admin/app/super/agents/page.tsx:1` | SUPER_ADMIN-only. |
| `/super/agents/:id` | `apps/web-admin/app/super/agents/[id]/page.tsx:1` | SUPER_ADMIN-only. |
| `/super/tenants` | `apps/web-admin/app/super/tenants/page.tsx:1` | SUPER_ADMIN-only. |
| `/super/billing/plans` | `apps/web-admin/app/super/billing/plans/page.tsx:1` | SUPER_ADMIN-only. |
| `/super/billing/providers` | `apps/web-admin/app/super/billing/providers/page.tsx:1` | SUPER_ADMIN-only. |
| `/super/billing/subscriptions` | `apps/web-admin/app/super/billing/subscriptions/page.tsx:1` | SUPER_ADMIN-only. |
| `/super/analytics` | `apps/web-admin/app/super/analytics/page.tsx:1` | SUPER_ADMIN-only. |

### Web Admin – Auth & API routes
| URL | File | Guard / Notes |
| --- | --- | --- |
| `/admin/dashboard` | `apps/web-admin/app/admin/dashboard/page.tsx:1` | Redirects to `/`; middleware still limits to admin roles (`apps/web-admin/middleware.ts:4-94`). |
| `/login` | `apps/web-admin/app/login/page.tsx:1` | Explicitly whitelisted in middleware for PUBLIC access. |
| `/api/auth/login` | `apps/web-admin/app/api/auth/login/route.ts:1` | Accepts only SUPER_ADMIN or TENANT_ADMIN logins; proxy to Core API. |
| `/api/auth/logout` | `apps/web-admin/app/api/auth/logout/route.ts:1` | Clears admin cookies; no auth guard. |

### Web Marketplace – Public routes (`apps/web-marketplace/app`)
| URL | File | Guard / Notes |
| --- | --- | --- |
| `/` | `apps/web-marketplace/app/page.tsx:1` | Explicitly whitelisted in middleware (`apps/web-marketplace/middleware.ts:4-72`). |
| `/sell` | `apps/web-marketplace/app/sell/page.tsx:1` | Public page; fetches onboarding API. |
| `/contact` | `apps/web-marketplace/app/contact/page.tsx:1` | Public. |
| `/listings` | `apps/web-marketplace/app/listings/page.tsx:1` | Public (middleware treats `/listings*` as public). |
| `/listings/new` | `apps/web-marketplace/app/listings/new/page.tsx:1` | Public; relies on client gating inside page. |
| `/listings/:id` | `apps/web-marketplace/app/listings/[id]/page.tsx:1` | Public property details. |
| `/agents` | `apps/web-marketplace/app/agents/page.tsx:1` | Public list. |
| `/agents/apply` | `apps/web-marketplace/app/agents/apply/page.tsx:1` | Public; posts to Core API. |
| `/about` | `apps/web-marketplace/app/about/page.tsx:1` | Public. |
| `/dashboard` | `apps/web-marketplace/app/dashboard/page.tsx:1` | **Currently unguarded** because it is neither public-listed nor `/broker/*`; middleware allows anyone. |
| `/sell` | `apps/web-marketplace/app/sell/page.tsx:1` | Public submission. |
| `/verify` | `apps/web-marketplace/app/verify/page.tsx:1` | Public verification form. |
| `/verify/:qr` | `apps/web-marketplace/app/verify/[qr]/page.tsx:1` | Public detail view. |
| `/legal/privacy` | `apps/web-marketplace/app/legal/privacy/page.tsx:1` | Public. |
| `/legal/terms` | `apps/web-marketplace/app/legal/terms/page.tsx:1` | Public. |
| `/broker/signin` | `apps/web-marketplace/app/broker/signin/page.tsx:1` | Public; login entry point. |
| `/broker/apply` | `apps/web-marketplace/app/broker/apply/page.tsx:1` | Public; recruitment funnel. |
| `/broker/pending` | *(no page file yet, but middleware reserves route)* | Public placeholder per middleware. |
| `/broker` | `apps/web-marketplace/app/broker/page.tsx:1` | **Not protected** because middleware only protects `/broker/*`; consider guarding this overview. |

### Web Marketplace – Broker-only routes (middleware-enforced via `apps/web-marketplace/middleware.ts:19-88`)
| URL | File | Guard / Notes |
| --- | --- | --- |
| `/broker/settings` | `apps/web-marketplace/app/broker/settings/page.tsx:1` | Needs `ab_broker_session` cookie. |
| `/broker/referral` | `apps/web-marketplace/app/broker/referral/page.tsx:1` | Broker-only. |
| `/broker/inquiries` | `apps/web-marketplace/app/broker/inquiries/page.tsx:1` | Broker-only. |
| `/broker/inquiries/:id` | `apps/web-marketplace/app/broker/inquiries/[id]/page.tsx:1` | Broker-only. |
| `/broker/listings` | `apps/web-marketplace/app/broker/listings/page.tsx:1` | Broker-only; uses API_BASE fallback. |
| `/broker/listings/new` | `apps/web-marketplace/app/broker/listings/new/page.tsx:1` | Broker-only. |
| `/broker/docs` | `apps/web-marketplace/app/broker/docs/page.tsx:1` | Broker-only. |
| `/broker/qr` | `apps/web-marketplace/app/broker/qr/page.tsx:1` | Broker-only. |
| `/broker/dashboard` | `apps/web-marketplace/app/broker/dashboard/page.tsx:1` | Broker-only. |
| `/broker/billing` | `apps/web-marketplace/app/broker/billing/page.tsx:1` | Broker-only. |
| `/broker/billing/invoices` | `apps/web-marketplace/app/broker/billing/invoices/page.tsx:1` | Broker-only. |
| `/broker/billing/subscribe` | `apps/web-marketplace/app/broker/billing/subscribe/page.tsx:1` | Broker-only. |
| `/broker/analytics` | `apps/web-marketplace/app/broker/analytics/page.tsx:1` | Broker-only. |

### Web Marketplace – Auth/API routes
| URL | File | Guard / Notes |
| --- | --- | --- |
| `/api/auth/login` | `apps/web-marketplace/app/api/auth/login/route.ts:1` | Uses demo accounts unless `NODE_ENV==='production'` or `CHECK_BROKER_STATUS==='true'`. Only role `BROKER`. |
| `/api/auth/logout` | `apps/web-marketplace/app/api/auth/logout/route.ts:1` | Clears broker cookies. |
| `/broker/logout` | (handled via `/api/auth/logout`) | Uses same route. |
| `/auth/callback` | `apps/web-marketplace/app/(auth)/callback/route.ts:1` | OAuth callback stub; public but only sets up redirect. |

### Mobile Inspector (Expo Router `apps/mobile-inspector/app`)
| URL | File | Guard / Notes |
| --- | --- | --- |
| `/` | `apps/mobile-inspector/app/index.tsx:1` | Expo screen; auth handled inside app context. |
| `/settings` | `apps/mobile-inspector/app/settings.tsx:1` | Requires mobile auth state. |
| `/terms` | `apps/mobile-inspector/app/terms.tsx:1` | Public screen. |
| `/result` | `apps/mobile-inspector/app/result.tsx:1` | Shows scan result; depends on auth/offline flags. |
| `/sync` | `apps/mobile-inspector/app/sync.tsx:1` | Sync view. |
| `/history` | `apps/mobile-inspector/app/history.tsx:1` | History list. |
| `/scan` | `apps/mobile-inspector/app/scan.tsx:1` | Scanner view. |

### Core API (NestJS controllers under `services/core-api/src` – all prefixed with `/v1` via `app.setGlobalPrefix`)
| Base Path | File | Guard / Notes |
| --- | --- | --- |
| `/health`, `/healthz`, `/readiness`, `/_status` | `services/core-api/src/app/app.controller.ts:14-45` | `_status` requires TENANT_ADMIN/AGENT + tenant via `@Roles` & `@RequireTenant`. `/healthz` unguarded for CapRover. |
| `/auth` | `services/core-api/src/auth/auth.controller.ts:1` | Auth endpoints; rely on JWT middleware; roles per handler. |
| `/admin` | `services/core-api/src/admin/admin.controller.ts:17` | `@Roles('TENANT_ADMIN','AGENT')` + `@RequireTenant`. |
| `/billing` | `services/core-api/src/billing/billing.controller.ts:26-177` | Mix of BROKER and TENANT_ADMIN guards per method. |
| `/admin/billing` | `services/core-api/src/billing/admin-billing.controller.ts:50` | Tenant admin only. |
| `/superadmin/billing` | `services/core-api/src/billing/superadmin-billing.controller.ts:44` | SUPER_ADMIN only. |
| `/payments/webhooks` | `services/core-api/src/billing/webhooks.controller.ts:1` | Public webhook endpoint (expects signature validation). |
| `/superadmin` | `services/core-api/src/superadmin/superadmin.controller.ts:16-76` | `@Roles('SUPER_ADMIN')`. |
| `/super/platform-settings` | `services/core-api/src/super-platform-settings/platform-settings.controller.ts:12-35` | SUPER_ADMIN only. |
| `/brokers` | `services/core-api/src/brokers/brokers.controller.ts:1` | Broker management (auth required). |
| `/public/brokers` | `services/core-api/src/brokers/public-brokers.controller.ts:1` | Public broker lookup. |
| `/verify` | `services/core-api/src/verify/verify.controller.ts:1` | QR verification; public but requires tenant headers. |
| `/marketplace` | `services/core-api/src/marketplace/marketplace.controller.ts:1` | Marketplace data; guard varies per handler. |
| `/reviews`, `/inspections`, `/listings`, `/inquiries` | Respective controller files enforce mix of tenant/broker roles via `@Roles` or manual checks (e.g., inquiries brokers at `services/core-api/src/inquiries/inquiries.controller.ts:90-140`). |
| `/public` | `services/core-api/src/public/public.controller.ts:33-74` | Public lead and agent application endpoints (tenant header required). |

### Media Service (`services/media-service/src/media/media.controller.ts:4-18`)
| URL | File | Guard / Notes |
| --- | --- | --- |
| `/health` | `services/media-service/src/media/media.controller.ts:8-16` | Exposed under `/v1/health` due to global prefix; unauthenticated.

---

## Environment Variables & Sources
- [x] Tables below capture every env var referenced in code or `.env.*` for web-admin, web-marketplace, and backend services, with defaults and source files.

### Web Admin (`apps/web-admin`)
| Variable | Default / Fallback | Where Read |
| --- | --- | --- |
| `NEXT_PUBLIC_CORE_API_BASE_URL` | Defaults to `http://localhost:4000` in API client (`apps/web-admin/lib/api-client.ts:7-15`) and server helper (`apps/web-admin/lib/api-server.ts:45-54`). | `lib/api-client.ts:7`, `lib/api-server.ts:45`, `app/api/auth/login/route.ts:3`, `app/(tenant)/qr-codes/page.tsx:35`, `app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:6`. |
| `NEXT_PUBLIC_API_BASE_URL` | Required; falls back to `NEXT_PUBLIC_CORE_API_BASE_URL` then `http://localhost:4000` inside `getBaseUrl` (`apps/web-admin/lib/api.ts:14-27`). | `lib/api.ts:14-35`, `app/components/ServiceStatus.tsx:32-35`, `app/(tenant)/health/page.tsx:33-35`, `app/(tenant)/settings/services/page.tsx:51-52`. |
| `NEXT_PUBLIC_VERIFY_BASE_URL` | Defaults to `https://verify.afribrok.com` for QR links (`apps/web-admin/app/(tenant)/qr-codes/page.tsx:35-37`, `[id]/page.tsx:55`). | `app/(tenant)/qr-codes/page.tsx:35-37`, `app/(tenant)/qr-codes/[id]/page.tsx:55`. |
| `NEXT_PUBLIC_TENANT_KEY` | Optional preset fed into Tailwind config (`apps/web-admin/tailwind.config.ts:7`). | `tailwind.config.ts:7`. |
| `NEXT_PUBLIC_APP_BASE_URL` | Documented in `.env.example` (`apps/web-admin/.env.example:1-2`); currently unused in code but required in docs for CapRover. |
| `NODE_ENV` | Used for logging and stricter behavior (`apps/web-admin/middleware.ts:55`, `app/(tenant)/layout.tsx:32-41`). | Multiple files for dev-only logs. |

### Web Marketplace (`apps/web-marketplace`)
| Variable | Default / Fallback | Where Read |
| --- | --- | --- |
| `NEXT_PUBLIC_CORE_API_BASE_URL` | Many pages fall back to `http://localhost:4000` or `http://localhost:8080` (inconsistent). | `app/api/auth/login/route.ts:3`, `app/verify/page.tsx:68-72`, `app/agents/apply/page.tsx:100-108`, `app/broker/listings/page.tsx:57-60`, `app/broker/listings/new/page.tsx:125-128`, `app/broker/docs/page.tsx:32-35`, `app/broker/billing/invoices/page.tsx:17-20`, etc. |
| `NEXT_PUBLIC_API_BASE_URL` | Provided in `.env.local` for web marketplace → `http://localhost:4000`; consumed by generic API client (`apps/web-marketplace/lib/api.ts:8-31`). |
| `NEXT_PUBLIC_API_URL` | Legacy alias used as fallback in broker listing pages (`apps/web-marketplace/app/broker/listings/page.tsx:57-60`, `app/broker/listings/new/page.tsx:125-128`, `app/broker/apply/page.tsx:107-114`). |
| `NEXT_PUBLIC_TENANT_KEY` | Required for tenant headers/client theming; default `et-addis` (`apps/web-marketplace/.env.local:1`, used in multiple pages such as `app/broker/billing/invoices/page.tsx:17-20`). |
| `NEXT_PUBLIC_APP_URL` | Controls metadata base for Next head tags (`apps/web-marketplace/app/layout.tsx:6-19`). |
| `NEXT_PUBLIC_APP_BASE_URL` | Documented in `.env.example:3` for CapRover; not referenced yet. |
| `CORE_API_BASE_URL` | Non-public env fallback for login route (`apps/web-marketplace/app/api/auth/login/route.ts:3`). |
| `CHECK_BROKER_STATUS` | If set to "true", login route always calls backend before trusting demo data (`apps/web-marketplace/app/api/auth/login/route.ts:100-126`). |
| `NODE_ENV` | Determines mock vs real login and cookie security (`apps/web-marketplace/app/api/auth/login/route.ts:51-166`). |

### Backend APIs (Core API + Media Service)
| Variable | Default / Fallback | Where Read |
| --- | --- | --- |
| `NODE_ENV` | Defaults to `development` via config schema; drives CORS strictness and dev auth bypasses (`services/core-api/src/main.ts:41-64`, `services/core-api/src/auth/jwt-auth.middleware.ts:33-86`). |
| `PORT` | Default `4000` in schema and `services/core-api/src/main.ts:6`; runtime Docker sets 8080 via `services/core-api/Dockerfile:36-53`. |
| `DATABASE_URL` | Required by Prisma (validated in `packages/config/env/schema.ts:5-18`). |
| `REDIS_URL` | Required for readiness checks (`services/core-api/src/health/health.service.ts:33-56`). |
| `CORS_ALLOWED_ORIGINS` | Optional override for allowed origins list (`services/core-api/src/main.ts:24-37`). |
| `JWT_SECRET` | Defaults to `'dev-secret-change-in-production'` (`services/core-api/src/auth/jwt-auth.middleware.ts:54-57`). |
| `JWT_ISSUER`, `JWT_AUDIENCE` | Optional verification settings (`services/core-api/src/auth/jwt-auth.middleware.ts:55-56`). |
| `CSRF_SECRET` | Defaults to `'change-me-in-production'` in CSRF middleware (`services/core-api/src/security/csrf.middleware.ts:12-25`). |
| `GIT_SHA` / `VERSION` | Used for status metadata (`services/core-api/src/status/status.service.ts:66-96`). |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `STORAGE_ENDPOINT`, `STORAGE_BUCKET` | Required via env schema for media storage. |
| `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | Required for Keycloak integration; referenced throughout auth services. |
| `TELEBIRR_SANDBOX_API_KEY`, `TELEBIRR_SANDBOX_SECRET` | Required per schema for payment integration. |
| `MEDIA_PORT` | Defaults to `"3001"` in media service bootstrap (`services/media-service/src/main.ts:6-18`). |

---

## Mock / Fixture Usage
- [x] All mock data pathways documented; default enablement status highlighted.

| Mock Source | File | Enabled By Default? | Notes |
| --- | --- | --- | --- |
| Demo broker accounts | `apps/web-marketplace/app/api/auth/login/route.ts:5-138` | **Yes in non-production** (only bypassed when `NODE_ENV==='production'` or `CHECK_BROKER_STATUS==='true'`). | Hard-coded credentials allow login without backend verification—consider guarding behind feature flag in dev only. |
| Offline QR verification fallback | `apps/mobile-inspector/src/utils/verify.ts:21-160` | No (requires `EXPO_PUBLIC_INSPECTOR_OFFLINE=enabled` or app.json extra). | When enabled, bypasses API and trusts local QR payloads; clearly logs when falling back. |

No MSW/Mirage libraries detected via repo search (`rg -l 'msw'` returned none). Next.js auth callback (`apps/web-marketplace/app/(auth)/callback/route.ts:1-40`) is a stub but does not ship fake data.

---

## API URL Construction & Hard-coded Hosts
- [x] Reviewed all modules that build API URLs; inconsistencies flagged.

**Web Admin**
- Central client `apps/web-admin/lib/api.ts:14-70` enforces a single `NEXT_PUBLIC_API_BASE_URL`, throwing in dev if missing. `lib/api-client.ts:7-105` and `lib/api-server.ts:35-74` default to `http://localhost:4000` when envs unset.
- Tenant service monitors (`apps/web-admin/app/(tenant)/settings/services/page.tsx:51-97` and `app/components/ServiceStatus.tsx:32-76`) hit `${base}/v1/_status` with cookies forwarded.
- QR tooling (`apps/web-admin/app/(tenant)/qr-codes/page.tsx:35-66` and `app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:6-58`) hard-code `http://localhost:8080` when env missing instead of the shared 4000 port; consider aligning with `NEXT_PUBLIC_API_BASE_URL`.
- Verification links rely on `NEXT_PUBLIC_VERIFY_BASE_URL` but default to `https://verify.afribrok.com` (`apps/web-admin/app/(tenant)/qr-codes/[id]/page.tsx:55-71`).

**Web Marketplace**
- Shared `lib/api.ts:8-74` requires either `NEXT_PUBLIC_API_BASE_URL` or `NEXT_PUBLIC_CORE_API_BASE_URL`; throws if both missing.
- Multiple feature pages bypass the shared client and roll their own `fetch` with divergent fallbacks:
  - `app/broker/listings/page.tsx:57-125`, `app/broker/listings/new/page.tsx:125-150`, `app/broker/apply/page.tsx:107-125`, and `app/agents/apply/page.tsx:100-132` default to `http://localhost:8080` (vs 4000 elsewhere).
  - `app/broker/docs/page.tsx:32-60` and `app/sell/page.tsx:49-80` hard-code `http://localhost:3000`/`4000` fallbacks.
  - `app/verify/page.tsx:68-105` and `app/verify/[qr]/page.tsx:11-52` default to `http://localhost:8080`.
- Recommendation: centralize all fetches behind `lib/api.ts` and expose a typed helper for tenant header injection to avoid host drift.

**Mobile Inspector**
- `apps/mobile-inspector/src/utils/api.ts:8-74` derives base from Expo extra, else `EXPO_PUBLIC_API_BASE_URL`, else `http://localhost:4000`—matches backend default.

**Backend**
- Core API sets `app.setGlobalPrefix('v1')` (`services/core-api/src/main.ts:5-11`); no external host construction.

---

## CORS & Cross-App Expectations
- [x] Backend CORS policies and frontend callers documented; discovered origins listed.

| Component | Expected Callers | Allowed Origins / Notes |
| --- | --- | --- |
| Core API (`services/core-api/src/main.ts:22-83`) | Web Admin, Web Marketplace, Mobile Inspector, future mobile apps. | `CORS_ALLOWED_ORIGINS` env overrides list; default includes `http://localhost:3000/3003/3004/3006` plus `https://afribrok.com`, `https://admin.afribrok.com`. In production, non-listed origins rejected. Dev mode returns `*`. |
| Media Service (`services/media-service/src/main.ts:10-14`) | Upload workflows from local frontends. | Hard-coded to `['http://localhost:3004','http://localhost:3003','http://localhost:3006']` with credentials. Needs production domains added. |
| Web Admin | Calls Core API for all data, sending `Authorization` + `X-Tenant` headers (`apps/web-admin/lib/api.ts:57-115`, `apps/web-admin/lib/api-client.ts:32-120`). |
| Web Marketplace | Also targets Core API via `lib/api.ts` and direct fetches; always adds tenant cookie header (`apps/web-marketplace/lib/api.ts:18-46`). |
| Mobile Inspector | Hits Core API verification endpoints via Expo fetch (`apps/mobile-inspector/src/utils/api.ts:50-120`). |
| Verify domain | Links built with `NEXT_PUBLIC_VERIFY_BASE_URL` expect `https://verify.afribrok.com` per admin QR pages, so CORS should allow that origin when embedding resources. |

**Flagged**: Media service lacks production origins; Core API allows wildcard in dev but relies on env for production—ensure CapRover sets `CORS_ALLOWED_ORIGINS` to match `https://admin.afribrok.com`, `https://market.afribrok.com`, mobile deep links.

---

## Role → Route Access Matrix
- [x] Expected access mapped from middleware, layouts, and Nest guards.

| Route Scope | SUPER-ADMIN | TENANT-ADMIN | BROKER | PUBLIC | Evidence |
| --- | --- | --- | --- | --- | --- |
| Web Admin `/super*` | ✅ (enforced by `apps/web-admin/app/super/layout.tsx:1-24`) | 🚫 (redirect to `/`) | 🚫 | 🚫 | Layout redirects non-super roles; middleware clears broker cookies (`apps/web-admin/middleware.ts:4-94`). |
| Web Admin tenant stack `/`, `/settings`, `/brokers`, `/reports`, etc. | ✅ (redirected to `/super` but middleware still allows) | ✅ (requires tenant cookie) | 🚫 | 🚫 | Tenant layout enforces TENANT_ADMIN/AGENT, super admin rerouted (`apps/web-admin/app/(tenant)/layout.tsx:23-58`). |
| Web Admin `/login` | ✅ | ✅ | ✅ (to clear broker cookie) | ✅ | Whitelisted in middleware (`apps/web-admin/middleware.ts:26-37`). |
| Web Marketplace `/broker/*` (except signin/apply/pending) | ⚠️ (should not use) but allowed if session cookie present | ⚠️ (not intended) | ✅ (requires `ab_broker_session`; `apps/web-marketplace/middleware.ts:74-88`) | 🚫 | Middleware only checks for presence of `ab_broker_session`. |
| Web Marketplace public (`/`, `/listings*`, `/verify*`, `/agents*`, `/about`, `/contact`) | ✅ | ✅ | ✅ | ✅ | Public prefixes defined in middleware (`apps/web-marketplace/middleware.ts:4-44`). |
| Web Marketplace `/dashboard` & `/broker` root | ✅ | ✅ | ✅ | ✅ (currently unguarded) | Not listed in public prefixes and not under `/broker/`; middleware never enforces auth. |
| Core API `/v1/superadmin/**`, `/v1/super/platform-settings/**` | ✅ | 🚫 | 🚫 | 🚫 | `@Roles('SUPER_ADMIN')` on controllers (`services/core-api/src/superadmin/superadmin.controller.ts:16-76`, `services/core-api/src/super-platform-settings/platform-settings.controller.ts:12-35`). |
| Core API `/v1/admin/**`, `/v1/_status` | ✅ | ✅ (must provide tenant via `@RequireTenant`) | 🚫 | 🚫 | `services/core-api/src/admin/admin.controller.ts:17-24` and `app.controller.ts:19-24`. |
| Core API `/v1/billing` (shared) | ✅ | ✅ (some methods) | ✅ (others) | 🚫 | Mixed `@Roles('BROKER','TENANT_ADMIN')` in `services/core-api/src/billing/billing.controller.ts:26-177`. |
| Core API `/v1/inquiries` broker endpoints | ✅ | 🚫 | ✅ | 🚫 | `@Roles('BROKER')` on listing endpoints (`services/core-api/src/inquiries/inquiries.controller.ts:90-149`). |
| Core API `/v1/public/**`, `/v1/verify/**`, `/v1/healthz`, `/v1/readiness` | ✅ | ✅ | ✅ | ✅ | Public controllers and health endpoints (`services/core-api/src/public/public.controller.ts:33-74`, `services/core-api/src/verify/verify.controller.ts:1-80`, `services/core-api/src/app/app.controller.ts:14-45`). |

Legend: ✅ allowed, 🚫 denied, ⚠️ not intended but currently possible (needs guard).

---

## Health & CapRover Endpoints
- [x] Health endpoints and CapRover probes documented.

| Service | Health Paths | CapRover / Docker Healthcheck | Notes |
| --- | --- | --- | --- |
| Core API | `/v1/health`, `/v1/_status` (TENANT_ADMIN), `/v1/healthz`, `/v1/readiness` (`services/core-api/src/app/app.controller.ts:14-45`). | Docker healthcheck hits `http://localhost:8080/healthz` (`services/core-api/Dockerfile:49-51`); CapRover comment identifies `/healthz`. | `/readiness` returns 503 on failures and describes DB/Redis state. |
| Media Service | `/v1/health` via controller (`services/media-service/src/media/media.controller.ts:4-18`). | Docker healthcheck hits `http://localhost:3000/health` (`services/media-service/Dockerfile:47-49`). | No readiness endpoint; consider adding. |
| Web Admin / Marketplace | Rely on backend health; no standalone CapRover health path beyond Next default (CapRover config only sets Dockerfile). |

CapRover app definitions (`apps/web-admin/captain-definition`, `apps/web-marketplace/captain-definition`, `services/core-api/captain-definition`, `services/media-service/captain-definition`) do not override health paths; they inherit Dockerfile settings, so ensure platform expects `/healthz` for core-api and `/health` for media-service.

---

## CORS Consumers & API Pairings Checklist
- [x] Web Admin ↔ Core API (cookies + headers) documented.
- [x] Web Marketplace ↔ Core API / Media Service mapped (though direct fetches need consolidation).
- [x] Mobile Inspector ↔ Core API verified.

---

## Outstanding Risks & Next Steps
- Harden unguarded marketplace routes such as `/dashboard` and `/broker` root by extending middleware checks.
- Align all admin and marketplace fetchers to a single `API_BASE` env to avoid `localhost:8080` drift.
- Populate production origins for media-service CORS and verify `CORS_ALLOWED_ORIGINS` in CapRover configs.
- Disable demo broker accounts outside explicit QA environments to prevent unintended logins.
