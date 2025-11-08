# Fix Plan

This document groups failures by subsystem and provides minimal fixes with file paths, exact lines, proposed changes, and risk levels. Fixes are ordered to minimize blast radius.

---

## 1. Environment Variables & Health/Readiness

### 1.1 Missing Readiness Endpoint (Media Service)
- **File**: `services/media-service/src/media/media.controller.ts`
- **Lines**: 8-11
- **Issue**: Media service only has `/health` endpoint; lacks `/readiness` endpoint for CapRover health checks
- **Proposed Fix**: Add `@Get('readiness')` endpoint that checks service dependencies (if any) and returns `{ ok: true }` or `503` with status details
- **Risk**: Low

### 1.2 Inconsistent Environment Variable Usage
- **Files**: 
  - `apps/web-admin/lib/api-client.ts:7`
  - `apps/web-admin/lib/api-server.ts:45-54`
  - `apps/web-admin/app/components/ServiceStatus.tsx:33-35`
  - `apps/web-admin/app/(tenant)/settings/services/page.tsx:51-52`
  - `apps/web-admin/app/(tenant)/health/page.tsx:33-35`
- **Lines**: Various (see FRONTEND-API-AUDIT.md section 3)
- **Issue**: Multiple files hard-code `http://localhost:4000` instead of using `NEXT_PUBLIC_API_BASE_URL` consistently
- **Proposed Fix**: Create shared `getApiBaseUrl()` helper in `apps/web-admin/lib/api.ts` and import it everywhere. Remove hard-coded fallbacks.
- **Risk**: Medium (could break dev workflows if env not set)

### 1.3 Host Drift in Web Marketplace
- **Files**:
  - `apps/web-marketplace/app/broker/listings/page.tsx:57-60`
  - `apps/web-marketplace/app/broker/listings/new/page.tsx:125-128`
  - `apps/web-marketplace/app/agents/apply/page.tsx:102-108`
  - `apps/web-marketplace/app/verify/page.tsx:68-72`
  - `apps/web-marketplace/app/verify/[qr]/page.tsx:11-52`
  - `apps/web-marketplace/app/broker/apply/page.tsx:107-114`
  - `apps/web-marketplace/app/broker/docs/page.tsx:32-35`
- **Lines**: Various (see FRONTEND-API-AUDIT.md section 3)
- **Issue**: Pages hard-code `http://localhost:8080` or `http://localhost:3000` instead of using shared `lib/api.ts` client
- **Proposed Fix**: Replace all direct `fetch` calls with `api()` helper from `apps/web-marketplace/lib/api.ts`
- **Risk**: Medium (requires testing all affected pages)

### 1.4 QR Tooling Hard-coded Port
- **Files**:
  - `apps/web-admin/app/(tenant)/qr-codes/page.tsx:35-37`
  - `apps/web-admin/app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:6`
- **Lines**: 35-37, 6
- **Issue**: QR endpoints default to `http://localhost:8080` instead of `NEXT_PUBLIC_API_BASE_URL`
- **Proposed Fix**: Use `getApiBaseUrl()` helper (from fix 1.2) instead of hard-coded port
- **Risk**: Low

---

## 2. Routing/RBAC Guards

### 2.1 Unguarded `/dashboard` Route (Web Marketplace)
- **File**: `apps/web-marketplace/middleware.ts`
- **Lines**: 4-17, 27-29, 68-72
- **Issue**: `/dashboard` is not in `PUBLIC_PREFIXES` and doesn't start with `/broker/`, so middleware never enforces auth. Route redirects to `/broker/dashboard` but is accessible without auth.
- **Proposed Fix**: Add check after line 72: if `pathname === '/dashboard'`, redirect to `/broker/signin` if no `ab_broker_session` cookie, else redirect to `/broker/dashboard`
- **Risk**: Low (route already redirects, just needs auth check)

### 2.2 Unguarded `/broker` Root Route (Web Marketplace)
- **File**: `apps/web-marketplace/middleware.ts`
- **Lines**: 31-44
- **Issue**: `/broker` (exact match) doesn't start with `/broker/` (trailing slash), so `isBrokerOnly()` returns false. Page redirects but is accessible without auth.
- **Proposed Fix**: Update `isBrokerOnly()` to also return `true` for exact match `pathname === '/broker'`, or add explicit check in middleware after line 72
- **Risk**: Low (page already redirects, just needs auth check)

### 2.3 RBAC Matrix Mismatch (Web Admin)
- **Files**: 
  - `apps/web-admin/app/(tenant)/layout.tsx:23-58` (per REPORT.md)
  - `RBAC-MATRIX.md:21-26`
- **Lines**: Various
- **Issue**: RBAC-MATRIX.md indicates `/settings`, `/qr-codes`, `/activity`, `/health`, `/reports`, `/users`, `/billing/*`, `/verifications/pending` should be SUPER_ADMIN only, but tenant layout allows TENANT_ADMIN
- **Proposed Fix**: Review requirements and either update RBAC-MATRIX.md to match implementation, or add role checks in tenant layout to restrict these routes to SUPER_ADMIN only
- **Risk**: High (affects access control; requires requirements clarification)

---

## 3. API Contracts & JSON

### 3.1 Missing `Accept: application/json` Header (Web Admin)
- **Files**:
  - `apps/web-admin/lib/api.ts:145-171`
  - `apps/web-admin/lib/api-client.ts:55-227` (all verb helpers)
  - `apps/web-admin/lib/api-server.ts:53-95`
  - `apps/web-admin/app/login/page.tsx:54-70`
  - `apps/web-admin/app/components/ServiceStatus.tsx:33-70`
  - `apps/web-admin/app/(tenant)/settings/services/page.tsx:51-115`
  - `apps/web-admin/app/(tenant)/health/page.tsx:33-70`
  - `apps/web-admin/app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:41-55`
- **Lines**: Various (see FRONTEND-API-AUDIT.md section 1)
- **Issue**: Fetch calls expect JSON but never set `Accept: application/json` header
- **Proposed Fix**: 
  - In `lib/api.ts:145-171`: Add `Accept: 'application/json'` to headers in `apiRequest()`
  - In `lib/api-client.ts`: Add `Accept` to `buildHeaders()` function
  - In `lib/api-server.ts`: Add `Accept` to headers before `fetch`
  - In individual pages: Add `Accept` to local header objects
- **Risk**: Low (additive change)

### 3.2 Missing `Accept: application/json` Header (Web Marketplace)
- **Files**:
  - `apps/web-marketplace/app/broker/listings/page.tsx:136-154`
  - `apps/web-marketplace/app/agents/apply/page.tsx:102-151`
  - `apps/web-marketplace/app/broker/signin/page.tsx:52-85`
  - `apps/web-marketplace/app/broker/billing/invoices/page.tsx:57-112`
  - `apps/web-marketplace/app/broker/listings/new/page.tsx:125-333`
  - `apps/web-marketplace/app/listings/[id]/page.tsx:16-52, 141-178`
  - `apps/web-marketplace/app/broker/inquiries/page.tsx:74-175`
  - `apps/web-marketplace/app/broker/inquiries/[id]/page.tsx:63-111`
  - `apps/web-marketplace/app/verify/page.tsx:68-104`
  - `apps/web-marketplace/app/verify/[qr]/page.tsx:24-70`
  - `apps/web-marketplace/app/sell/page.tsx:49-113`
  - `apps/web-marketplace/app/broker/qr/page.tsx:31-62`
  - `apps/web-marketplace/app/broker/apply/page.tsx:110-185`
  - `apps/web-marketplace/app/broker/docs/page.tsx:32-55`
  - `apps/web-marketplace/app/context/auth-context.tsx:112-125`
- **Lines**: Various (see FRONTEND-API-AUDIT.md section 1)
- **Issue**: Direct `fetch` calls omit `Accept` header
- **Proposed Fix**: Replace all direct `fetch` calls with `api()` helper from `lib/api.ts` (which already includes `Accept: application/json` at line 35)
- **Risk**: Medium (requires refactoring multiple pages)

### 3.3 JSON Parsing Without Content-Type Guard (Web Admin)
- **Files**:
  - `apps/web-admin/lib/api.ts:163-192`
  - `apps/web-admin/lib/api-client.ts:117-227`
  - `apps/web-admin/lib/api-server.ts:72-96`
  - `apps/web-admin/app/login/page.tsx:65-74`
  - `apps/web-admin/app/components/ServiceStatus.tsx:58-70`
  - `apps/web-admin/app/(tenant)/settings/services/page.tsx:74-115`
  - `apps/web-admin/app/(tenant)/health/page.tsx:58-70`
  - `apps/web-admin/app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:41-55`
- **Lines**: Various (see FRONTEND-API-AUDIT.md section 2)
- **Issue**: Code calls `response.json()` without checking `Content-Type` header, causing errors when server returns HTML
- **Proposed Fix**: 
  - In `lib/api.ts`: Add check `const contentType = response.headers.get('content-type')` before parsing; throw descriptive error if not JSON (mirror pattern from `apps/web-marketplace/lib/api.ts:59-110`)
  - In `lib/api-client.ts` and `lib/api-server.ts`: Add same Content-Type check
  - In individual pages: Add guard before `response.json()` or use shared helper
- **Risk**: Medium (error handling change)

### 3.4 JSON Parsing Without Content-Type Guard (Web Marketplace)
- **Files**:
  - `apps/web-marketplace/app/broker/listings/page.tsx:142-154`
  - `apps/web-marketplace/app/broker/inquiries/page.tsx:74-175`
  - `apps/web-marketplace/app/broker/billing/invoices/page.tsx:68-120`
  - `apps/web-marketplace/app/listings/[id]/page.tsx:29-41, 148-176`
  - `apps/web-marketplace/app/verify/page.tsx:72-105`
  - `apps/web-marketplace/app/verify/[qr]/page.tsx:24-70`
  - `apps/web-marketplace/app/sell/page.tsx:56-110`
  - `apps/web-marketplace/app/broker/apply/page.tsx:143-200`
  - `apps/web-marketplace/app/broker/docs/page.tsx:32-55`
- **Lines**: Various (see FRONTEND-API-AUDIT.md section 2)
- **Issue**: Direct `fetch` calls parse JSON without Content-Type validation
- **Proposed Fix**: Replace all direct `fetch` calls with `api()` helper from `lib/api.ts` (which already includes Content-Type check at lines 59-110)
- **Risk**: Medium (requires refactoring)

---

## 4. Frontend API Client & Guards

### 4.1 Inconsistent API Client Usage
- **Files**: All files listed in sections 3.2 and 3.4
- **Lines**: Various
- **Issue**: Pages bypass shared `lib/api.ts` client and roll their own `fetch` calls, leading to missing headers and inconsistent error handling
- **Proposed Fix**: Refactor all direct `fetch` calls to use `api()` helper from `apps/web-marketplace/lib/api.ts`. This consolidates Accept header, Content-Type validation, and error handling.
- **Risk**: Medium (requires testing all affected pages)

### 4.2 Web Admin API Client Missing Content-Type Guard
- **File**: `apps/web-admin/lib/api.ts:163-192`
- **Lines**: 163-192
- **Proposed Fix**: Add Content-Type check before `response.json()` (see fix 3.3)
- **Risk**: Low (defensive improvement)

---

## 5. CORS/Preflight

### 5.1 Media Service Missing Production Origins
- **File**: `services/media-service/src/main.ts:10-14`
- **Lines**: 11-14
- **Issue**: CORS origin list hard-coded to localhost only: `['http://localhost:3004', 'http://localhost:3003', 'http://localhost:3006']`. Production origins missing.
- **Proposed Fix**: Read from env var `CORS_ALLOWED_ORIGINS` (comma-separated) with fallback to localhost list. Add production origins: `https://admin.afribrok.com`, `https://afribrok.com`, `https://market.afribrok.com`
- **Risk**: Medium (CORS misconfiguration blocks production requests)

### 5.2 Core API CORS Configuration Verification
- **File**: `services/core-api/src/main.ts:22-37` (per REPORT.md)
- **Lines**: 22-37
- **Issue**: Core API uses `CORS_ALLOWED_ORIGINS` env var but needs verification that production origins are set in CapRover
- **Proposed Fix**: Document required env var in CapRover config notes (see section 7). No code change needed if env is set correctly.
- **Risk**: Low (configuration issue, not code)

---

## 6. Mocks/Fixtures

### 6.1 Demo Broker Accounts Enabled in Non-Production
- **File**: `apps/web-marketplace/app/api/auth/login/route.ts:5-14, 79-126`
- **Lines**: 6-14 (DEMO_BROKER_ACCOUNTS), 79-126 (usage logic)
- **Issue**: Demo accounts are checked unless `NODE_ENV === 'production'` OR `CHECK_BROKER_STATUS === 'true'`. This allows demo logins in staging/dev unless explicitly disabled.
- **Proposed Fix**: 
  - Option A: Remove demo account check entirely; always call backend API
  - Option B: Add explicit feature flag `ENABLE_DEMO_ACCOUNTS=true` (default false) and only check demo accounts if flag is set
  - Option C: Only check demo accounts if `NODE_ENV === 'development'` AND `ENABLE_DEMO_ACCOUNTS === 'true'`
- **Risk**: High (security risk if demo accounts accessible in staging)

### 6.2 Offline QR Verification Fallback
- **File**: `apps/mobile-inspector/src/utils/verify.ts:21-160` (per REPORT.md)
- **Lines**: 21-160
- **Issue**: When `EXPO_PUBLIC_INSPECTOR_OFFLINE=enabled`, app bypasses API and trusts local QR payloads
- **Proposed Fix**: Ensure `EXPO_PUBLIC_INSPECTOR_OFFLINE` is never set in production builds. Add build-time check or document in production checklist.
- **Risk**: Medium (bypasses security if enabled in production)

---

## 7. CapRover Config Notes

### 7.1 Health Check Paths
- **Files**: 
  - `services/core-api/captain-definition` (verify)
  - `services/media-service/captain-definition` (verify)
- **Issue**: CapRover needs to know health check paths. Core API uses `/healthz`, Media Service uses `/health` (per REPORT.md lines 272-276)
- **Proposed Fix**: Document in deployment guide:
  - Core API: Health path = `/healthz` (returns `200` + JSON `{"ok":true}`)
  - Media Service: Health path = `/v1/health` (returns `200` + JSON)
  - Media Service: Add `/v1/readiness` endpoint (see fix 1.1) and configure as readiness probe
- **Risk**: Low (documentation)

### 7.2 Environment Variables Checklist
- **Issue**: Multiple env vars need to be set in CapRover (per PROD-CHECKLIST.md)
- **Proposed Fix**: Document required env vars:
  - **Core API**: `CORS_ALLOWED_ORIGINS` (comma-separated: `https://admin.afribrok.com,https://afribrok.com,https://market.afribrok.com`), `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `DATABASE_URL`, `REDIS_URL`, `NODE_ENV=production`
  - **Media Service**: `CORS_ALLOWED_ORIGINS` (same as Core API), `MEDIA_PORT=3000`, `NODE_ENV=production`
  - **Web Admin**: `NEXT_PUBLIC_API_BASE_URL=https://api.afribrok.com`, `NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com`, `NEXT_PUBLIC_VERIFY_BASE_URL=https://verify.afribrok.com`, `NODE_ENV=production`
  - **Web Marketplace**: `NEXT_PUBLIC_API_BASE_URL=https://api.afribrok.com`, `NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com`, `NEXT_PUBLIC_TENANT_KEY=et-addis`, `NODE_ENV=production`, `CHECK_BROKER_STATUS=true` (to disable demo accounts)
- **Risk**: Low (documentation)

### 7.3 HTTPS & Force Redirect
- **Issue**: CapRover must enable HTTPS and force redirect for all apps (per PROD-CHECKLIST.md line 6)
- **Proposed Fix**: Document in deployment guide: Enable "Enable HTTPS" and "Force HTTPS" toggles for `admin.afribrok.com`, `afribrok.com`, `api.afribrok.com`, `media.afribrok.com`
- **Risk**: Low (configuration)

---

## Summary by Risk Level

### High Risk
- 2.3: RBAC Matrix Mismatch (requires requirements clarification)
- 6.1: Demo Broker Accounts (security risk)

### Medium Risk
- 1.2: Inconsistent Environment Variable Usage
- 1.3: Host Drift in Web Marketplace
- 3.2: Missing Accept Header (Web Marketplace)
- 3.3: JSON Parsing Without Content-Type Guard (Web Admin)
- 3.4: JSON Parsing Without Content-Type Guard (Web Marketplace)
- 4.1: Inconsistent API Client Usage
- 5.1: Media Service Missing Production Origins
- 6.2: Offline QR Verification Fallback

### Low Risk
- 1.1: Missing Readiness Endpoint (Media Service)
- 1.4: QR Tooling Hard-coded Port
- 2.1: Unguarded `/dashboard` Route
- 2.2: Unguarded `/broker` Root Route
- 3.1: Missing Accept Header (Web Admin)
- 4.2: Web Admin API Client Missing Content-Type Guard
- 5.2: Core API CORS Configuration Verification
- 7.1-7.3: CapRover Config Notes

---

## Recommended Fix Order

1. **Phase 1 (Env & Health)**: Fixes 1.1, 1.2, 1.3, 1.4
2. **Phase 2 (Routing/RBAC)**: Fixes 2.1, 2.2, 2.3
3. **Phase 3 (API Contracts)**: Fixes 3.1, 3.2, 3.3, 3.4
4. **Phase 4 (Frontend Guards)**: Fixes 4.1, 4.2
5. **Phase 5 (CORS)**: Fixes 5.1, 5.2
6. **Phase 6 (Remove Mocks)**: Fixes 6.1, 6.2
7. **Phase 7 (CapRover Config)**: Document fixes 7.1, 7.2, 7.3

