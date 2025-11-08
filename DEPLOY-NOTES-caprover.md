# CapRover Deployment Notes - Final Requirements

This document contains the exact, final requirements for deploying AfriBrok to CapRover.

## App ↔ Domain Mapping

| App Name | Domain | Purpose |
|----------|--------|---------|
| `core-api` | `api.afribrok.com` | Main API service |
| `web-admin` | `admin.afribrok.com` | Admin dashboard |
| `web-marketplace` | `afribrok.com` | Marketplace frontend |

### Domain Configuration

For each app in CapRover:
1. Go to **App Configs** → **Custom Domain**
2. Add the domain listed above
3. **Enable "Force HTTPS by redirecting all HTTP traffic to HTTPS"** ✅
4. **Enable "Use Let's Encrypt to get a free SSL certificate"** ✅

**Important**: Ensure DNS records point to your CapRover server IP before enabling SSL.

## Health Check Path

### Core API (`core-api`)

- **Health Check Path**: `/healthz`
- **Expected Response**: `200 OK` with JSON `{"ok":true}`
- **CapRover Configuration**:
  - Go to `core-api` app → **App Configs** → **HTTP Settings**
  - Set **Health Check Path**: `/healthz`
  - Verify it returns `200` with JSON response

**Test Command**:
```bash
curl https://api.afribrok.com/v1/healthz
# Expected: {"ok":true}
```

## Force HTTPS

**Required for all apps with public domains:**

1. ✅ **Enable "Force HTTPS by redirecting all HTTP traffic to HTTPS"** in CapRover
2. ✅ **Enable "Use Let's Encrypt to get a free SSL certificate"** in CapRover
3. Verify: `curl http://api.afribrok.com` should redirect to `https://api.afribrok.com`

## Environment Variables Required Per App

### Core API (`core-api`)

**Required Variables** (from `services/core-api/.env.example`):

```bash
# Node Environment
NODE_ENV=production

# Server Port (must match Container Port in HTTP Settings)
PORT=4000

# Database Connection (use internal CapRover hostname)
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@postgres.captain:5432/postgres

# Redis Connection (use internal CapRover hostname)
# If Redis has NO password:
REDIS_URL=redis://redis.captain:6379
# If Redis has a password:
REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis.captain:6379

# JWT Secret (CHANGE FROM DEFAULT!)
JWT_SECRET=your-production-jwt-secret-change-this

# CSRF Secret (CHANGE FROM DEFAULT!)
CSRF_SECRET=your-production-csrf-secret-change-this

# AWS S3 Storage Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=afribrok-media

# OIDC / Keycloak Configuration
OIDC_ISSUER_URL=https://keycloak.example.com/realms/afribrok
OIDC_CLIENT_ID=afribrok-api
OIDC_CLIENT_SECRET=your-oidc-client-secret

# Telebirr Payment Integration
TELEBIRR_SANDBOX_API_KEY=your-telebirr-api-key
TELEBIRR_SANDBOX_SECRET=your-telebirr-secret
```

**Optional Variables**:

```bash
# CORS Allowed Origins (comma-separated)
# If not set, defaults to localhost dev origins + production domains
CORS_ALLOWED_ORIGINS=https://admin.afribrok.com,https://afribrok.com,https://market.afribrok.com

# JWT Verification Settings
JWT_ISSUER=your-jwt-issuer
JWT_AUDIENCE=your-jwt-audience

# Version Metadata
GIT_SHA=your-git-sha
VERSION=1.0.0
```

### Web Admin (`web-admin`)

**Required Variables** (from `apps/web-admin/.env.example`):

```bash
# Node Environment
NODE_ENV=production

# Required: API Base URL
NEXT_PUBLIC_API_BASE_URL=https://api.afribrok.com

# Optional: Legacy API Base URL (fallback)
NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com

# Optional: Verify Base URL for QR code links
NEXT_PUBLIC_VERIFY_BASE_URL=https://verify.afribrok.com

# Optional: Tenant Key for theming
NEXT_PUBLIC_TENANT_KEY=et-addis

# Optional: App Base URL for CapRover deployment
NEXT_PUBLIC_APP_BASE_URL=https://admin.afribrok.com
```

### Web Marketplace (`web-marketplace`)

**Required Variables** (from `apps/web-marketplace/.env.example`):

```bash
# Node Environment
NODE_ENV=production

# Required: API Base URL
NEXT_PUBLIC_API_BASE_URL=https://api.afribrok.com

# Required: Tenant Key for tenant headers and client theming
NEXT_PUBLIC_TENANT_KEY=et-addis

# Optional: Legacy API Base URL (fallback)
NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com

# Optional: Legacy API URL (fallback for broker listing pages)
NEXT_PUBLIC_API_URL=https://api.afribrok.com

# Optional: App URL for metadata base
NEXT_PUBLIC_APP_URL=https://afribrok.com

# Optional: App Base URL for CapRover deployment
NEXT_PUBLIC_APP_BASE_URL=https://afribrok.com

# Optional: Non-public env fallback for login route
CORE_API_BASE_URL=https://api.afribrok.com

# Optional: Check Broker Status flag
CHECK_BROKER_STATUS=false

# Optional: Enable Mocks flag (should be false in production)
NEXT_PUBLIC_ENABLE_MOCKS=false
```

## PostGIS Requirements

**PostGIS is required** for geospatial features in the database.

### PostgreSQL Image

When creating the PostgreSQL app in CapRover:
- **Use One-Click App**: PostgreSQL
- **Or use custom image**: `postgis/postgis:15-3.3` (PostgreSQL 15 with PostGIS 3.3)
- **Or use custom image**: `postgis/postgis:16-3.3` (PostgreSQL 16 with PostGIS 3.3)

**Image Format**: `postgis/postgis:<postgresql-version>-<postgis-version>`

### Enable PostGIS Extension

After PostgreSQL is deployed, connect to the database and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

**Via CapRover Terminal**:
1. Go to `postgres` app → **App Configs** → **Terminal**
2. Run: `psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS postgis;"`
3. Run: `psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS postgis_topology;"`

**Via SSH**:
```bash
# Find PostgreSQL container
docker ps | grep postgres

# Connect to PostgreSQL
docker exec -it <postgres-container-name> psql -U postgres

# Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
\q
```

**Verify PostGIS is enabled**:
```sql
SELECT PostGIS_Version();
```

## Redis/Postgres Internal Hosts

CapRover uses internal DNS for service-to-service communication. Use these hostnames in environment variables:

### PostgreSQL

**Hostname Format**:
- **DNS-friendly format** (recommended): `postgres.captain:5432`
- **Internal format** (also works): `srv-captain--postgres:5432`

**Connection String**:
```
postgresql://postgres:YOUR_PASSWORD@postgres.captain:5432/postgres
```

**If your PostgreSQL app is named differently** (e.g., `afribrok-db`):
- Use: `afribrok-db.captain:5432`
- Or: `srv-captain--afribrok-db:5432`

### Redis

**Hostname Format**:
- **DNS-friendly format** (recommended): `redis.captain:6379`
- **Internal format** (also works): `srv-captain--redis:6379`

**Connection String** (no password):
```
redis://redis.captain:6379
```

**Connection String** (with password):
```
redis://:YOUR_REDIS_PASSWORD@redis.captain:6379
```

**If your Redis app is named differently** (e.g., `afribrok-redis`):
- Use: `afribrok-redis.captain:6379`
- Or: `srv-captain--afribrok-redis:6379`

### Other Services

**Core API** (if needed for internal communication):
- `core-api.captain:4000`

**Media Service** (if needed for internal communication):
- `media-service.captain:3001`

## HTTP Settings Summary

| App | Container Port | HTTP Port (CapRover) | Health Check Path |
|-----|---------------|----------------------|-------------------|
| `core-api` | `4000` | `8080` (or any) | `/healthz` |
| `web-admin` | `3000` | `3000` (or any) | N/A |
| `web-marketplace` | `3000` | `3000` (or any) | N/A |

**Important**: The **Container Port** must match the `PORT` environment variable for each app.

## Complete Deployment Checklist

- [ ] Create PostgreSQL app (One-Click App or custom `postgis/postgis` image)
- [ ] Enable PostGIS extension in PostgreSQL
- [ ] Create Redis app (One-Click App)
- [ ] Configure `core-api` app:
  - [ ] Set all required environment variables
  - [ ] Set Container Port: `4000`
  - [ ] Set Health Check Path: `/healthz`
  - [ ] Add domain: `api.afribrok.com`
  - [ ] Enable Force HTTPS
  - [ ] Enable Let's Encrypt SSL
- [ ] Configure `web-admin` app:
  - [ ] Set all required environment variables
  - [ ] Set Container Port: `3000`
  - [ ] Add domain: `admin.afribrok.com`
  - [ ] Enable Force HTTPS
  - [ ] Enable Let's Encrypt SSL
- [ ] Configure `web-marketplace` app:
  - [ ] Set all required environment variables
  - [ ] Set Container Port: `3000`
  - [ ] Add domain: `afribrok.com`
  - [ ] Enable Force HTTPS
  - [ ] Enable Let's Encrypt SSL
- [ ] Verify DNS records point to CapRover server IP
- [ ] Run database migrations: `pnpm prisma migrate deploy` in `core-api` container
- [ ] Test health endpoint: `curl https://api.afribrok.com/v1/healthz`
- [ ] Verify all apps show "Running" status in CapRover

## Notes

- All environment variables must be set in CapRover's **App Configs** → **Environment Variables**
- Replace all placeholder values (e.g., `YOUR_POSTGRES_PASSWORD`, `your-aws-access-key-id`) with actual credentials
- Internal service communication uses `.captain` hostnames (CapRover's internal DNS)
- Health check path `/healthz` is required for `core-api` to enable CapRover health monitoring
- Force HTTPS must be enabled for all public-facing apps to ensure secure connections

