# CapRover Deployment Steps - Complete Guide

This guide provides step-by-step instructions for deploying AfriBrok to CapRover.

## Current Status

✅ **Already Created:**
- `core-api` app
- `web-admin` app  
- `web-marketplace` app

## Next Steps - Complete Deployment Guide

### Step 1: Create Infrastructure Apps (PostgreSQL & Redis)

#### 1.1 Create PostgreSQL Database

1. In CapRover Dashboard → **Apps** → **One-Click Apps/Dockerfile**
2. Click **One-Click Apps** (NOT "Deploy from Dockerfile")
3. Search for **PostgreSQL** or scroll to find it
4. Click **PostgreSQL**
5. Configure:
   - **App Name**: `postgres` (or `afribrok-db`)
   - **PostgreSQL Password**: Set a strong password (save this!)
   - **PostgreSQL Version**: `15` or `16` (PostGIS will be added later)
6. Click **Deploy**
7. Wait for deployment to complete

**Important**: 
- **No Dockerfile needed!** CapRover provides a pre-configured PostgreSQL Docker image
- After deployment, you'll need to enable PostGIS extension. See Step 2.1 below.

#### 1.2 Create Redis Cache

1. In CapRover Dashboard → **Apps** → **One-Click Apps/Dockerfile**
2. Click **One-Click Apps** (NOT "Deploy from Dockerfile")
3. Search for **Redis** or scroll to find it
4. Click **Redis**
5. Configure:
   - **App Name**: `redis` (or `afribrok-redis`)
   - **Redis Password**: Set a strong password (optional but recommended) - **Save this password!**
6. Click **Deploy**
7. Wait for deployment to complete

**Important**: 
- **No Dockerfile needed!** CapRover provides a pre-configured Redis Docker image
- If you set a password, you'll need it in your `REDIS_URL` environment variable

### Step 2: Configure Database (PostGIS Extension)

After PostgreSQL is deployed, you need to enable PostGIS extension:

1. SSH into your CapRover server
2. Find the PostgreSQL container:
   ```bash
   docker ps | grep postgres
   ```
3. Connect to PostgreSQL:
   ```bash
   docker exec -it <postgres-container-name> psql -U postgres
   ```
4. Enable PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS postgis_topology;
   \q
   ```

**Alternative**: You can also do this through CapRover's terminal feature:
- Go to your `postgres` app in CapRover
- Click **App Configs** → **Terminal**
- Run: `psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS postgis;"`

### Step 3: Create Media Service App

You need to create the `media-service` app:

1. In CapRover Dashboard → **Apps** → **One-Click Apps/Dockerfile**
2. Click **One-Click Apps/Dockerfile**
3. Select **Deploy from GitHub/Bitbucket/GitLab** OR **Deploy from Dockerfile**
4. If using Dockerfile:
   - **App Name**: `media-service`
   - **Repository**: Your GitHub repo URL
   - **Branch**: `main` (or your branch)
   - **Dockerfile Path**: `services/media-service/Dockerfile`
   - **Context Path**: `/` (root of repo)
5. Click **Deploy**

### Step 4: Configure Environment Variables

Configure environment variables for each app in CapRover:

#### 4.1 Core API (`core-api`)

Go to `core-api` app → **App Configs** → **Environment Variables**:

```bash
NODE_ENV=production
PORT=4000  # This is the Container Port - must match Container Port in HTTP Settings

# Database (use internal CapRover hostname)
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@postgres.captain:5432/postgres

# Redis (use internal CapRover hostname)
# If Redis has NO password:
REDIS_URL=redis://redis.captain:6379

# If Redis has a password (recommended):
REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis.captain:6379
# Or if your Redis app is named "afribrok-redis":
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@afribrok-redis.captain:6379

# Alternative hostname format (also works):
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@srv-captain--redis:6379
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@srv-captain--afribrok-redis:6379

# Object Storage (S3-compatible)
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=afribrok-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# OIDC Authentication (Keycloak or your OIDC provider)
OIDC_ISSUER_URL=https://auth.afribrok.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret

# Telebirr Payment (Sandbox)
TELEBIRR_SANDBOX_API_KEY=your-telebirr-api-key
TELEBIRR_SANDBOX_SECRET=your-telebirr-secret
```

**Important Notes:**
- Replace `YOUR_POSTGRES_PASSWORD` with the password you set in Step 1.1
- Replace `YOUR_REDIS_PASSWORD` if you set one
- Use `postgres.captain` and `redis.captain` as hostnames (CapRover's internal DNS)
- Replace all placeholder values with your actual credentials

#### 4.2 Media Service (`media-service`)

Go to `media-service` app → **App Configs** → **Environment Variables**:

```bash
NODE_ENV=production
PORT=3001

# Object Storage (S3-compatible)
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=afribrok-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

#### 4.3 Web Admin (`web-admin`)

Go to `web-admin` app → **App Configs** → **Environment Variables**:

```bash
NODE_ENV=production
PORT=3000  # This is the Container Port - must match Container Port in HTTP Settings

# Public URLs
NEXT_PUBLIC_APP_BASE_URL=https://admin.afribrok.com
NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com
```

#### 4.4 Web Marketplace (`web-marketplace`)

Go to `web-marketplace` app → **App Configs** → **Environment Variables**:

```bash
NODE_ENV=production
PORT=3000  # This is the Container Port - must match Container Port in HTTP Settings

# Public URLs
NEXT_PUBLIC_APP_BASE_URL=https://afribrok.com
NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com
NEXT_PUBLIC_TENANT_KEY=ethiopia-addis
```

### Step 5: Configure Domains & SSL

For each app, configure domains and enable SSL:

#### 5.1 Core API (`core-api`)

1. Go to `core-api` app → **App Configs**
2. Under **HTTP Settings**:
   - **Has Persistent Data**: No
   - **HTTP Port**: `8080` (or any port - this is CapRover's routing port)
   - **Container Port**: `4000` (must match your app's PORT env var)
3. Under **Custom Domain**:
   - Add domain: `api.afribrok.com` (or your domain)
   - Enable **Force HTTPS by redirecting all HTTP traffic to HTTPS**
   - Enable **Use Let's Encrypt to get a free SSL certificate**
4. Click **Save & Update**

#### 5.2 Web Admin (`web-admin`)

1. Go to `web-admin` app → **App Configs**
2. Under **HTTP Settings**:
   - **HTTP Port**: `3000` (or any port - this is CapRover's routing port)
   - **Container Port**: `3000` (Next.js default - must match PORT env var)
3. Under **Custom Domain**:
   - Add domain: `admin.afribrok.com` (or your domain)
   - Enable HTTPS and Let's Encrypt
4. Click **Save & Update**

#### 5.3 Web Marketplace (`web-marketplace`)

1. Go to `web-marketplace` app → **App Configs**
2. Under **HTTP Settings**:
   - **HTTP Port**: `3000` (or any port - this is CapRover's routing port)
   - **Container Port**: `3000` (Next.js default - must match PORT env var)
3. Under **Custom Domain**:
   - Add domain: `afribrok.com` (main front page - or your domain)
   - Enable HTTPS and Let's Encrypt
4. Click **Save & Update**

#### 5.4 Media Service (`media-service`)

Media service is internal only (no public domain needed):
1. Go to `media-service` app → **App Configs**
2. Under **HTTP Settings**:
   - **HTTP Port**: `3001`
   - **Container Port**: `3001`
3. **No custom domain needed** (accessed internally by core-api)

### Step 6: Run Database Migrations

After all apps are deployed and configured:

1. SSH into your CapRover server
2. Find the core-api container:
   ```bash
   docker ps | grep core-api
   ```
3. Execute migrations:
   ```bash
   docker exec -it <core-api-container-name> sh
   cd /app
   pnpm prisma migrate deploy
   ```
4. (Optional) Seed initial data:
   ```bash
   pnpm prisma db seed
   ```

**Alternative using CapRover Terminal:**
- Go to `core-api` app → **App Configs** → **Terminal**
- Run: `cd /app && pnpm prisma migrate deploy`

### Step 7: Verify Deployment

#### 7.1 Check All Services Are Running

In CapRover Dashboard, verify all apps show **Running** status:
- ✅ `core-api`
- ✅ `web-admin`
- ✅ `web-marketplace`
- ✅ `media-service`
- ✅ `postgres`
- ✅ `redis`

#### 7.2 Test Health Endpoints

```bash
# Test API health
curl https://api.afribrok.com/v1/health/live
curl https://api.afribrok.com/v1/health/ready

# Test web apps (should return HTML)
curl https://admin.afribrok.com
curl https://afribrok.com
```

#### 7.3 Check Logs

In CapRover Dashboard:
- Go to each app → **App Logs**
- Verify no critical errors
- Check for successful database connections
- Verify Redis connections

## Complete App List Summary

Here's the complete list of apps you need in CapRover:

| App Name | Type | Port | Domain | Purpose |
|----------|------|------|--------|---------|
| `core-api` | Application | 4000 | `api.afribrok.com` | Main API service |
| `web-admin` | Application | 3004 | `admin.afribrok.com` | Admin dashboard |
| `web-marketplace` | Application | 3003 | `afribrok.com` | Main front page / Marketplace |
| `media-service` | Application | 3001 | (internal) | Media upload service |
| `postgres` | One-Click App | 5432 | (internal) | PostgreSQL database |
| `redis` | One-Click App | 6379 | (internal) | Redis cache |

## Internal Service Communication

CapRover uses internal DNS. Services can communicate using:

- **PostgreSQL**: `postgres.captain:5432` (or `srv-captain--postgres:5432`)
- **Redis**: `redis.captain:6379` (or `srv-captain--redis:6379`)
- **Core API**: `core-api.captain:4000`
- **Media Service**: `media-service.captain:3001`

### Understanding One-Click App Hostnames

CapRover uses two naming formats for one-click apps:

1. **DNS-friendly format** (recommended): `app-name.captain:port`
   - Example: `redis.captain:6379` or `afribrok-redis.captain:6379`
   - Use this in environment variables

2. **Internal format**: `srv-captain--app-name:port`
   - Example: `srv-captain--redis:6379` or `srv-captain--afribrok-redis:6379`
   - This is CapRover's internal naming (also works)

**Example Redis connection with password:**
```javascript
// If your Redis app is named "afribrok-redis" with password
const client = redis.createClient({
  host: 'afribrok-redis.captain',  // or 'srv-captain--afribrok-redis'
  port: 6379,
  password: 'your-redis-password'
});

// Or using connection string in environment variable:
// REDIS_URL=redis://:your-redis-password@afribrok-redis.captain:6379
```

Use these hostnames in your `DATABASE_URL` and `REDIS_URL` environment variables.

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running: Check app status in CapRover
2. Check `DATABASE_URL` format: `postgresql://postgres:PASSWORD@postgres.captain:5432/postgres`
3. Verify password matches what you set in PostgreSQL one-click app
4. Check logs: `core-api` app → **App Logs**

### Redis Connection Issues

1. Verify Redis is running: Check app status in CapRover
2. Check `REDIS_URL` format: `redis://redis.captain:6379` (or with password)
3. Check logs: `core-api` app → **App Logs**

### App Won't Start

1. Check **App Logs** in CapRover
2. Verify all environment variables are set correctly
3. Check Dockerfile paths are correct
4. Verify repository access (if using Git deployment)

### SSL Certificate Issues

1. Ensure DNS records point to your CapRover server IP
2. Wait a few minutes for Let's Encrypt to issue certificate
3. Check **App Logs** for SSL errors
4. Verify domain is accessible: `curl http://your-domain.com`

## Next Steps After Deployment

1. ✅ Configure monitoring and alerts
2. ✅ Set up automated backups for PostgreSQL
3. ✅ Configure object storage (S3 bucket)
4. ✅ Set up OIDC provider (Keycloak)
5. ✅ Test all functionality end-to-end
6. ✅ Configure CI/CD for automatic deployments
7. ✅ Set up log aggregation
8. ✅ Configure rate limiting

## Quick Reference Commands

### View Logs
```bash
# In CapRover Dashboard → App → App Logs
# Or via SSH:
docker logs <container-name> -f
```

### Restart App
```bash
# In CapRover Dashboard → App → App Configs → Restart
```

### Check Service Health
```bash
curl https://api.afribrok.com/v1/health/ready
```

### Backup Database
```bash
docker exec postgres pg_dump -U postgres postgres > backup.sql
```

## Support

If you encounter issues:
1. Check CapRover logs for each app
2. Verify environment variables are correct
3. Check network connectivity between services
4. Review the main deployment guide: `docs/PRODUCTION-DEPLOYMENT.md`

