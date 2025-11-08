# Frontend API Audit

This file summarizes risky API call sites in `apps/web-admin` and `apps/web-marketplace` that (a) omit `Accept: application/json`, (b) parse JSON without checking `Content-Type`, and (c) inconsistently reference `NEXT_PUBLIC_API_BASE_URL` vs. string-literal hosts. The goal is advisory only—no code was modified.

## 1. Fetch calls missing `Accept: application/json`
The following call sites build `fetch` requests that expect JSON but never set an Accept header. Add `headers: { Accept: 'application/json', ... }` (or extend the existing header builder) to make the expectation explicit and avoid content-negotiation surprises.

| File:Line | Context |
| --- | --- |
| `apps/web-admin/lib/api.ts:145-171` | Core `apiRequest` used across the admin app never sets Accept before calling `response.json()`. Add Accept within the merged headers so every consumer benefits. |
| `apps/web-admin/lib/api-client.ts:55-227` | All verb helpers (`get/post/put/patch/delete`) rely on `buildHeaders`, which only adds `Content-Type`. Inject Accept there. |
| `apps/web-admin/lib/api-server.ts:53-95` | Server-side helper behaves like the client versions; add Accept prior to `fetch`. |
| `apps/web-admin/app/login/page.tsx:54-70` | Login form POSTs to `/api/auth/login` and immediately parses JSON. Include Accept in the request header object. |
| `apps/web-admin/app/components/ServiceStatus.tsx:33-70` | `_status` poller sets Content-Type + auth headers only. Add Accept before `fetch`. |
| `apps/web-admin/app/(tenant)/settings/services/page.tsx:51-115` | Both the initial `_status` call and the per-endpoint validation loop omit Accept. Inject Accept where headers are built. |
| `apps/web-admin/app/(tenant)/health/page.tsx:33-70` | Health dashboard fetch mirrors the ServiceStatus risk. |
| `apps/web-admin/app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:41-55` | Toggle endpoint uses only `Content-Type`; add Accept to ensure JSON control-plane responses are negotiated. |
| `apps/web-marketplace/app/broker/listings/page.tsx:136-154` | Broker listings loader parses JSON without declaring Accept. |
| `apps/web-marketplace/app/agents/apply/page.tsx:102-151` | Public agent application submitter expects JSON success/error; add Accept in the local headers literal. |
| `apps/web-marketplace/app/broker/signin/page.tsx:52-85` | Broker login POST to `/api/auth/login` mirrors the admin login gap. |
| `apps/web-marketplace/app/broker/billing/invoices/page.tsx:57-112` | Tenant + auth headers are set but Accept is missing before response parsing. |
| `apps/web-marketplace/app/broker/listings/new/page.tsx:125-333` | Multiple API calls (presign, property creation, listing creation) expect JSON responses but never set Accept. |
| `apps/web-marketplace/app/listings/[id]/page.tsx:16-52` & `:141-178` | Server components fetch listing detail and similar data without Accept. |
| `apps/web-marketplace/app/broker/inquiries/page.tsx:74-175` | List/detail/update calls all omit Accept. |
| `apps/web-marketplace/app/broker/inquiries/[id]/page.tsx:63-111` | Detail fetch lacks Accept before JSON parsing. |
| `apps/web-marketplace/app/verify/page.tsx:68-104` & `app/verify/[qr]/page.tsx:24-70` | Verification pages fetch API JSON but omit Accept. |
| `apps/web-marketplace/app/sell/page.tsx:49-113` | Lead form POST expects JSON but uses only `Content-Type`. |
| `apps/web-marketplace/app/broker/qr/page.tsx:31-62` | QR admin fetch uses Content-Type only. |
| `apps/web-marketplace/app/broker/apply/page.tsx:110-185` | Broker application submission lacks Accept. |
| `apps/web-marketplace/app/broker/docs/page.tsx:32-55` | Document fetch uses literal fallback host and lacks Accept. |
| `apps/web-marketplace/app/context/auth-context.tsx:112-125` | Logout call expects JSON status; add Accept to the fetch options. |

_Add Accept once in shared helpers (where available) to eliminate most of these line-by-line issues._

## 2. JSON parsing without `Content-Type` guards
Many of the same call sites immediately call `response.json()` without ensuring the server actually returned JSON. This makes error pages or HTML responses throw cryptic runtime errors. Suggested mitigations: check `response.headers.get('content-type')` before parsing, or wrap parsing in `try/catch` that reports unexpected types.

| File:Line | Notes & Suggested Guard |
| --- | --- |
| `apps/web-admin/lib/api.ts:163-192` | Wrap the `response.json()` call with a check for `content-type?.includes('application/json')` and throw a descriptive error otherwise (the marketplace `lib/api.ts` demonstrates the pattern). |
| `apps/web-admin/lib/api-client.ts:117-227` | Each verb method could verify Content-Type once after `response.ok`. Consider factoring into a helper. |
| `apps/web-admin/lib/api-server.ts:72-96` | Same as above for server-side calls. |
| `apps/web-admin/app/login/page.tsx:65-74` | Guard the `response.json()` result; otherwise HTML error bodies throw. |
| `apps/web-admin/app/components/ServiceStatus.tsx:58-70` and `(tenant)/settings/services/page.tsx:74-115` | Before `const data = await response.json()`, confirm JSON and log text fallback for troubleshooting. |
| `apps/web-admin/app/(tenant)/health/page.tsx:58-70` | Same issue and mitigation. |
| `apps/web-admin/app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:41-55` | Toggle endpoint assumes JSON; wrap parse or handle empty body. |
| `apps/web-marketplace/app/broker/listings/page.tsx:142-154`, `app/broker/inquiries/page.tsx:74-175`, `app/broker/billing/invoices/page.tsx:68-120`, etc. | All these hooks call `await response.json()` without verifying Content-Type. Use the defensive code in `apps/web-marketplace/lib/api.ts` as a template. |
| `apps/web-marketplace/app/listings/[id]/page.tsx:29-41` & `:148-176` | Server components should `throw` if the header isn't JSON to avoid confusing hydration errors. |
| `apps/web-marketplace/app/verify/page.tsx:72-105` & `app/verify/[qr]/page.tsx:24-70` | Add `const ctype = response.headers.get('content-type')` and handle HTML gracefully. |
| `apps/web-marketplace/app/sell/page.tsx:56-110`, `app/broker/apply/page.tsx:143-200`, `app/broker/docs/page.tsx:32-55` | Same risk for public forms. |

_In general, any component doing manual `fetch` should reuse the hardened client (`apps/web-marketplace/lib/api.ts` or an equivalent for web-admin) to guarantee Accept + Content-Type enforcement._

## 3. `NEXT_PUBLIC_API_BASE_URL` usage & host drift
Only a few files actually consume `NEXT_PUBLIC_API_BASE_URL`. Others hard-code fallback hosts, leading to inconsistent routing between environments.

| File:Line | Usage | Notes |
| --- | --- | --- |
| `apps/web-admin/lib/api.ts:14-27` | Primary admin API client prefers `NEXT_PUBLIC_API_BASE_URL`, falls back to `NEXT_PUBLIC_CORE_API_BASE_URL`, then `http://localhost:4000`. Good, but other helpers (e.g., `lib/api-client.ts`) never reference `NEXT_PUBLIC_API_BASE_URL`. |
| `apps/web-admin/app/components/ServiceStatus.tsx:33-35` | Uses `NEXT_PUBLIC_API_BASE_URL` but hard-codes a `http://localhost:4000` fallback. Consider re-exporting the base from `lib/api.ts` to avoid drift. |
| `apps/web-admin/app/(tenant)/settings/services/page.tsx:51-52` | Same as above. |
| `apps/web-admin/app/(tenant)/health/page.tsx:33-35` | Same as above. |
| `apps/web-marketplace/lib/api.ts:8-12` | Shared marketplace client enforces `NEXT_PUBLIC_API_BASE_URL || NEXT_PUBLIC_CORE_API_BASE_URL`; recommend routing every marketplace fetch through this helper instead of ad-hoc URLs. |

### String-literal hosts & mismatches
Several components ignore `NEXT_PUBLIC_API_BASE_URL` entirely and fall back to hard-coded URLs, even when they expect the same API as the shared client:

- `apps/web-admin/lib/api-client.ts:7` and `lib/api-server.ts:47` default to `http://localhost:4000` instead of consuming `NEXT_PUBLIC_API_BASE_URL`, so admin UI can point at a different API than widgets using the shared client.
- `apps/web-admin/app/(tenant)/qr-codes/page.tsx:35` and `app/(tenant)/qr-codes/[id]/ui/ActionsPanel.tsx:6` default to `http://localhost:8080`, which diverges from the rest of the admin stack.
- `apps/web-marketplace/app/broker/listings/page.tsx:56-59`, `app/broker/listings/new/page.tsx:125-128`, and `app/agents/apply/page.tsx:102-108` fall back to `http://localhost:8080`, bypassing `NEXT_PUBLIC_API_BASE_URL` entirely.
- `apps/web-marketplace/app/broker/apply/page.tsx:107-114` and `app/broker/docs/page.tsx:32-35` mix `NEXT_PUBLIC_CORE_API_BASE_URL` with string literals like `http://localhost:3000`.
- `apps/web-marketplace/app/verify/page.tsx:70-73` defaults to `http://localhost:8080`, while other parts of the site use `NEXT_PUBLIC_API_BASE_URL` (4000). This can silently point verification traffic at the wrong service.

**Advice:** create a single helper (per app) that exports the resolved API base (respecting `NEXT_PUBLIC_API_BASE_URL`), and import it everywhere. Avoid sprinkling literal `localhost` ports across components; this ensures production and staging share the exact same routing logic.

---

These findings are advisory; no source files were changed. Addressing the shared header builders (`lib/api.ts`, `lib/api-client.ts`, `lib/api-server.ts`) and consolidating base-URL resolution will eliminate most of the smaller per-page issues.
