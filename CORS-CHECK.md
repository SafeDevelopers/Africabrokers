# CORS Validation Checklist

## Known Browser Origins
- `https://admin.afribrok.com` (web-admin)
- `https://afribrok.com` / `https://market.afribrok.com` (web-marketplace public & broker portal)
- Local development origins documented in code: `http://localhost:3000`, `http://localhost:3003`, `http://localhost:3004`, `http://localhost:3006`

## Expected API Hosts & Policies

### Core API (`API_BASE`, default `https://api.afribrok.com`)
- **Access-Control-Allow-Origin**: In production the server checks `CORS_ALLOWED_ORIGINS`; expected values include the origins above. In development it responds with `*` (wildcard).
- **Access-Control-Allow-Credentials**: `true` (explicitly enabled in `services/core-api/src/main.ts`).
- **Pass criteria**: For each allowed origin, OPTIONS preflight returns `200` (or `204`), the `Access-Control-Allow-Origin` header matches the Origin, and `Access-Control-Allow-Credentials: true` is present. Fail if the header is missing, mismatched, or credentials are blocked.

Example preflight probe:
```bash
curl -i -X OPTIONS "$API_BASE/v1/marketplace/listings" \
  -H "Origin: https://afribrok.com" \
  -H "Access-Control-Request-Method: GET"
```

### Media Service (`MEDIA_BASE`, default `https://media.afribrok.com` or `http://localhost:3001`)
- Hard-coded allowed origins: `http://localhost:3004`, `http://localhost:3003`, `http://localhost:3006` (development defaults) with `credentials: true`.
- **Pass criteria**: Requests from the listed origins return `Access-Control-Allow-Origin` echoing the origin plus `Access-Control-Allow-Credentials: true`. Any production origin not listed should be added before go-live; failing preflights indicate missing configuration.

Example preflight:
```bash
curl -i -X OPTIONS "$MEDIA_BASE/v1/uploads" \
  -H "Origin: https://admin.afribrok.com" \
  -H "Access-Control-Request-Method: POST"
```

## Marketplace/API Endpoint Spot Checks
Run preflights for key routes to ensure both admin and marketplace origins are whitelisted:

1. **Public listings (marketplace)**
   ```bash
   curl -i -X OPTIONS "$API_BASE/v1/marketplace/listings" \
     -H "Origin: https://afribrok.com" \
     -H "Access-Control-Request-Method: GET"
   ```
   - Pass if `Access-Control-Allow-Origin: https://afribrok.com` and `Access-Control-Allow-Credentials: true` are present.

2. **Admin status endpoint**
   ```bash
   curl -i -X OPTIONS "$API_BASE/v1/_status" \
     -H "Origin: https://admin.afribrok.com" \
     -H "Access-Control-Request-Method: GET"
   ```
   - Pass if origin echoes and credentials allowed; fail otherwise.

3. **Broker APIs**
   ```bash
   curl -i -X OPTIONS "$API_BASE/v1/broker/listings" \
     -H "Origin: https://afribrok.com" \
     -H "Access-Control-Request-Method: GET"
   ```
   - Pass if broker origin is honored with credentials; fail if blocked.

## Pass/Fail Summary
- **Pass**: Every tested origin receives `Access-Control-Allow-Origin` equal to the request origin, `Access-Control-Allow-Credentials: true`, and required headers (`Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`) reference the requested method/header set. Preflight status must be `200` (core API explicitly forces 200 for OPTIONS).
- **Fail**: Missing or wildcard origin when credentials are required, absent credentials flag, HTTP errors (4xx/5xx) during preflight, or HTML body instead of CORS headers.

Document each probe result (status code + headers) before release. No application code changes were made for this checklist.
