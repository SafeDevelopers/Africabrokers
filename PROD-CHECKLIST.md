# Production Go-Live Checklist

Use this list to confirm the Africabrok stack is production-ready. Each item should be verified (checkmark with date/owner) before launch or major releases.

- [ ] **Domain mapping** — `api.afribrok.com`, `admin.afribrok.com`, and `afribrok.com` are pointed to the correct CapRover apps (core API, web-admin, web-marketplace). Document DNS + CapRover app IDs.
- [ ] **HTTPS + force redirect** — CapRover "Enable HTTPS" and "Force HTTPS" toggles are ON for all three apps. Verify by hitting `http://` and ensuring it redirects to `https://`.
- [ ] **Health checks** — CapRover health path `/healthz` responds with `200` + JSON `{"ok":true}` on each deploy (core API). Attach sample curl output.
- [ ] **404 handling** — `curl -sS -H "Accept: application/json" $API_BASE/v1/unknown-route -i` returns `404` with JSON body (no HTML). Capture response snippet.
- [ ] **Environment variables** — All required env vars from REPORT.md (NEXT_PUBLIC_* for frontends; DATABASE_URL/REDIS_URL/JWT_* etc. for backend) are set in CapRover. Screenshot or export the env panel.
- [ ] **Readiness probe** — `curl -sS $API_BASE/v1/readiness` returns `200`/`ok:true` and shows DB + Redis status `UP`. Save log timestamp.
- [ ] **JWT configuration** — `JWT_ISSUER`, `JWT_AUDIENCE`, and `JWT_SECRET` are populated; test by sending a token from the wrong app and confirming the API responds `403 Invalid token`.
- [ ] **Rate limiting/logging** — Rate limiting (e.g., Nginx or API middleware) and structured logging are enabled. Document the module/config file providing this protection.
- [ ] **Backups** — Postgres automated daily backups configured with retention policy (specify N days) and last successful backup timestamp.
- [ ] **PostGIS** — If geospatial features are used, run `SELECT PostGIS_Version();` in production DB and record the output.
- [ ] **CORS allowlist** — `CORS_ALLOWED_ORIGINS` only includes `https://admin.afribrok.com` and `https://afribrok.com` (plus necessary subdomains). Confirm by inspecting CapRover env and performing preflight curls from both origins.
- [ ] **Mock data disabled** — Ensure `NODE_ENV=production` and `CHECK_BROKER_STATUS`/demo account flags are unset so no mock accounts operate in production.

Provide links to evidence (screenshots, logs, curl outputs) next to each item before signing off.
