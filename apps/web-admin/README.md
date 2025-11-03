# Web Admin (Regulator Dashboard)

Milestone 1 Next.js app for regulators, inspectors, and admins. Implements:

- Role-aware sign-in with tenant theming.
- KYC review queue, document preview, approve/deny workflow.
- QR issuance preview and download link.
- Complaints triage view.

See `docs/specs/spec.md` (Frontend Specification) and `docs/specs/wireframes.md` (#3 Admin Dashboard) before implementation.

## Environment Variables

Create a `.env.local` file in this directory with the following variables:

```bash
# Core API Base URL
# For local development, use http://localhost:8080
# For production, update to your production API URL
NEXT_PUBLIC_CORE_API_BASE_URL=http://localhost:8080

# Verify Base URL
# This is the base URL for the verification page where QR codes point to
# For local development, you may want to use http://localhost:3000 (or your local verify app port)
# For production, use https://verify.afribrok.com
NEXT_PUBLIC_VERIFY_BASE_URL=https://verify.afribrok.com
```

## Required Backend Endpoints

The QR code management pages require the following admin endpoints:

- `GET /v1/admin/qrcodes` - List all QR codes with optional `?limit=60` query parameter
- `GET /v1/admin/qrcodes/:id` - Get a single QR code by ID
- `POST /v1/admin/qrcodes/:id/activate` - Activate a revoked QR code
- `POST /v1/admin/qrcodes/:id/revoke` - Revoke an active QR code

These endpoints have been implemented in the `services/core-api` backend. Make sure your backend is running and accessible at the URL specified in `NEXT_PUBLIC_CORE_API_BASE_URL`.
