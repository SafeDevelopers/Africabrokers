# RBAC Matrix

Legend: `✅` = allowed anonymously/public, `🔒` = allowed but requires authenticated role listed, `🚫` = forbidden for that role.

## Web Admin (apps/web-admin)
| Route | SA | TA | Public | Broker | Notes |
| --- | --- | --- | --- | --- | --- |
| `/login` | ✅ | ✅ | ✅ | ✅ | Login page intentionally public; middleware allows without auth. |
| `/`, `/admin/dashboard` | 🔒 | 🔒 | 🚫 | 🚫 | Tenant dashboard views; both SA and TA must be signed in. |
| `/brokers` | 🔒 | 🔒 | 🚫 | 🚫 | Broker list scoped to tenant. |
| `/brokers/:id` | 🔒 | 🔒 | 🚫 | 🚫 | Detail view of tenant brokers. |
| `/brokers/pending` | 🔒 | 🔒 | 🚫 | 🚫 | Pending broker approvals per tenant. |
| `/brokers/verification` | 🔒 | 🔒 | 🚫 | 🚫 | Verification queue. |
| `/listings` | 🔒 | 🔒 | 🚫 | 🚫 | Tenant listing index. |
| `/listings/:id` | 🔒 | 🔒 | 🚫 | 🚫 | Listing detail/ moderation. |
| `/listings/featured`, `/listings/pending`, `/listings/reported` | 🔒 | 🔒 | 🚫 | 🚫 | Listing variants limited to tenant scope. |
| `/reviews`, `/reviews/:id` | 🔒 | 🔒 | 🚫 | 🚫 | Reviews dashboard per tenant. |
| `/reviews/compliance`, `/reviews/compliance/:id` | 🔒 | 🔒 | 🚫 | 🚫 | Compliance workflows per tenant. |
| `/reviews/audit`, `/reviews/pending` | 🔒 | 🔒 | 🚫 | 🚫 | Audit/pending queues for tenant admins. |
| `/payouts/pending` | 🔒 | 🔒 | 🚫 | 🚫 | Tenant payout approvals. |
| `/settings`, `/settings/services` | 🔒 | 🚫 | 🚫 | 🚫 | System configuration reserved for SA. |
| `/qr-codes`, `/qr-codes/:id` | 🔒 | 🚫 | 🚫 | 🚫 | QR issuance/management considered global tooling. |
| `/activity`, `/health`, `/reports` | 🔒 | 🚫 | 🚫 | 🚫 | Observability & reporting restricted to SA. |
| `/users` | 🔒 | 🚫 | 🚫 | 🚫 | Global user management for SA only. |
| `/billing/invoices`, `/billing/plans`, `/billing/payment-methods` | 🔒 | 🚫 | 🚫 | 🚫 | Billing configuration treated as global admin responsibility. |
| `/verifications/pending` | 🔒 | 🚫 | 🚫 | 🚫 | Identity/verifications queue restricted to SA (outside TA remit from requirements). |
| `/super` | 🔒 | 🚫 | 🚫 | 🚫 | Super-admin workspace entry. |
| `/super/settings` | 🔒 | 🚫 | 🚫 | 🚫 | Global settings. |
| `/super/agents`, `/super/agents/:id` | 🔒 | 🚫 | 🚫 | 🚫 | Manage broker/agent applicants across tenants. |
| `/super/analytics` | 🔒 | 🚫 | 🚫 | 🚫 | Platform-wide analytics unavailable to TA. |
| `/super/billing/plans`, `/super/billing/providers`, `/super/billing/subscriptions` | 🔒 | 🚫 | 🚫 | 🚫 | Platform billing providers/config. |
| `/super/tenants` | 🔒 | 🚫 | 🚫 | 🚫 | Tenant management is SA-only. |
| `/superadmin/dashboard` | 🔒 | 🚫 | 🚫 | 🚫 | Redirect into SA space; blocked for other roles. |

_Assumptions_: Tenant-admin scope intentionally limited to dashboard, listings, brokers, payouts, and reviews per requirements; all other admin routes treated as SA-only despite current UI implementations.

## Web Marketplace (apps/web-marketplace)
| Route | SA | TA | Public | Broker | Notes |
| --- | --- | --- | --- | --- | --- |
| `/`, `/about`, `/contact` | ✅ | ✅ | ✅ | ✅ | Marketing pages open to everyone. |
| `/agents`, `/agents/apply` | ✅ | ✅ | ✅ | ✅ | Recruitment funnels are public. |
| `/sell` | ✅ | ✅ | ✅ | ✅ | Lead form; no auth required. |
| `/legal/privacy`, `/legal/terms` | ✅ | ✅ | ✅ | ✅ | Compliance pages. |
| `/listings`, `/listings/:id` | ✅ | ✅ | ✅ | ✅ | Public browse + detail. |
| `/verify`, `/verify/:qr` | ✅ | ✅ | ✅ | ✅ | QR verification portal. |
| `/listings/new` | 🚫 | 🚫 | 🚫 | 🔒 | Requires broker authentication (uses auth context) to create listings. |
| `/broker/signin`, `/broker/apply` | ✅ | ✅ | ✅ | ✅ | Entry points for brokers remain public. |
| `/dashboard` (→ `/broker/dashboard`) | 🚫 | 🚫 | 🚫 | 🔒 | Redirects into broker-only dashboard. |
| `/broker` (→ `/broker/dashboard`) | 🚫 | 🚫 | 🚫 | 🔒 | Broker area entry; must be signed in. |
| `/broker/dashboard` | 🚫 | 🚫 | 🚫 | 🔒 | Core broker console. |
| `/broker/listings`, `/broker/listings/new` | 🚫 | 🚫 | 🚫 | 🔒 | CRUD on broker’s own listings only. |
| `/broker/docs` | 🚫 | 🚫 | 🚫 | 🔒 | Broker document vault/KYC uploads. |
| `/broker/settings` | 🚫 | 🚫 | 🚫 | 🔒 | Broker profile & KYC settings. |
| `/broker/analytics` | 🚫 | 🚫 | 🚫 | 🔒 | Performance metrics for signed-in broker. |
| `/broker/billing`, `/broker/billing/invoices`, `/broker/billing/subscribe` | 🚫 | 🚫 | 🚫 | 🔒 | Broker billing & subscription management. |
| `/broker/inquiries`, `/broker/inquiries/:id` | 🚫 | 🚫 | 🚫 | 🔒 | Leads routed to the authenticated broker only. |
| `/broker/qr` | 🚫 | 🚫 | 🚫 | 🔒 | Broker QR toolkit. |
| `/broker/referral` | 🚫 | 🚫 | 🚫 | 🔒 | Referral features tied to broker account. |

_Expectations_: Public marketplace visitors (including SA/TA browsing anonymously) may only view marketing and listing content. All `/broker/**` routes (and `/dashboard`) require a valid broker session (`🔒`) and should restrict data to the authenticated broker; other roles are denied (`🚫`).
