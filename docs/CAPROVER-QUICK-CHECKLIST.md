# CapRover Deployment - Quick Checklist

## ✅ What You Already Have

- [x] `core-api` app created
- [x] `web-admin` app created
- [x] `web-marketplace` app created

## 📋 What You Need to Do Next

### Step 1: Create Infrastructure Apps (5 minutes)

#### Create PostgreSQL Database
- [ ] Go to CapRover → **Apps** → **One-Click Apps/Dockerfile**
- [ ] Click **One-Click Apps** (NOT "Deploy from Dockerfile")
- [ ] Search for **PostgreSQL**
- [ ] Create app named: `postgres` (or `afribrok-db`)
- [ ] Set a strong password (save it!)
- [ ] Deploy and wait for completion
- [ ] Note: No Dockerfile needed - CapRover handles the PostgreSQL image automatically
- [ ] Enable PostGIS extension (see detailed guide)

#### Create Redis Cache
- [ ] Go to CapRover → **Apps** → **One-Click Apps/Dockerfile**
- [ ] Click **One-Click Apps** (NOT "Deploy from Dockerfile")
- [ ] Search for **Redis**
- [ ] Create app named: `redis` (or `afribrok-redis`)
- [ ] Set a password (optional but recommended) - **Save this password!**
- [ ] Deploy and wait for completion
- [ ] Note: No Dockerfile needed - CapRover handles the Redis image automatically

### Step 2: Create Media Service App (5 minutes)

- [ ] Go to CapRover → **Apps** → **One-Click Apps/Dockerfile**
- [ ] Select **Deploy from Dockerfile**
- [ ] Create app named: `media-service`
- [ ] Set repository URL and branch
- [ ] Set Dockerfile path: `services/media-service/Dockerfile`
- [ ] Deploy

### Step 3: Configure Environment Variables (15 minutes)

#### Core API (`core-api`)
- [ ] Set `DATABASE_URL=postgresql://postgres:PASSWORD@postgres.captain:5432/postgres`
  - Replace `PASSWORD` with the password you set when creating PostgreSQL
- [ ] Set `REDIS_URL=redis://redis.captain:6379`
  - If Redis has a password: `REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis.captain:6379`
  - Replace `YOUR_REDIS_PASSWORD` with the password you set when creating Redis
- [ ] Set `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `AWS_*` variables
- [ ] Set `OIDC_*` variables
- [ ] Set `TELEBIRR_*` variables

#### Media Service (`media-service`)
- [ ] Set `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `AWS_*` variables

#### Web Admin (`web-admin`)
- [ ] Set `NEXT_PUBLIC_APP_BASE_URL=https://admin.afribrok.com`
- [ ] Set `NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com`

#### Web Marketplace (`web-marketplace`)
- [ ] Set `NEXT_PUBLIC_APP_BASE_URL=https://afribrok.com`
- [ ] Set `NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com`
- [ ] Set `NEXT_PUBLIC_TENANT_KEY=ethiopia-addis`

### Step 4: Configure Domains & SSL (10 minutes)

#### Core API
- [ ] Set HTTP Port: `4000`
- [ ] Add domain: `api.afribrok.com`
- [ ] Enable HTTPS with Let's Encrypt

#### Web Admin
- [ ] Set HTTP Port: `3004`
- [ ] Add domain: `admin.afribrok.com`
- [ ] Enable HTTPS with Let's Encrypt

#### Web Marketplace
- [ ] Set HTTP Port: `3003`
- [ ] Add domain: `afribrok.com` (main front page)
- [ ] Enable HTTPS with Let's Encrypt

#### Media Service
- [ ] Set HTTP Port: `3001`
- [ ] No domain needed (internal only)

### Step 5: Run Database Migrations (5 minutes)

- [ ] SSH into CapRover server OR use CapRover Terminal
- [ ] Connect to `core-api` container
- [ ] Run: `pnpm prisma migrate deploy`
- [ ] (Optional) Run: `pnpm prisma db seed`

### Step 6: Verify Everything Works (5 minutes)

- [ ] Check all apps show "Running" status
- [ ] Test: `curl https://api.afribrok.com/v1/health/ready`
- [ ] Test: `curl https://admin.afribrok.com`
- [ ] Test: `curl https://afribrok.com`
- [ ] Check logs for errors

## 📦 Complete App List

You need **6 apps** total in CapRover:

1. ✅ `core-api` - Main API (already created)
2. ✅ `web-admin` - Admin dashboard (already created)
3. ✅ `web-marketplace` - Marketplace (already created)
4. ⬜ `media-service` - Media upload service (need to create)
5. ⬜ `postgres` - PostgreSQL database (need to create)
6. ⬜ `redis` - Redis cache (need to create)

## 🔗 Internal Service Names

When configuring environment variables, use these hostnames:

- **PostgreSQL**: `postgres.captain:5432` (or `srv-captain--postgres:5432`)
- **Redis**: `redis.captain:6379` (or `srv-captain--redis:6379`)
- **Core API**: `core-api.captain:4000`
- **Media Service**: `media-service.captain:3001`

### 📝 Understanding One-Click Apps

**One-Click Apps (PostgreSQL, Redis) don't need Dockerfiles!**

When you create a one-click app in CapRover:
- CapRover provides a pre-configured Docker image
- You just need to set the app name and configuration (password, etc.)
- No Dockerfile is required - CapRover handles everything

**Hostname Formats:**

CapRover uses two naming conventions for one-click apps:

1. **DNS-friendly format** (recommended): `app-name.captain:port`
   - Example: `redis.captain:6379` or `afribrok-redis.captain:6379`
   - Use this in environment variables

2. **Internal format**: `srv-captain--app-name:port`
   - Example: `srv-captain--redis:6379` or `srv-captain--afribrok-redis:6379`
   - This is CapRover's internal naming (also works, but less readable)

**For Redis with password:**
```javascript
// If your Redis app is named "afribrok-redis" with password
const client = redis.createClient({
  host: 'afribrok-redis.captain',  // or 'srv-captain--afribrok-redis'
  port: 6379,
  password: 'Ilovemywifeandsons1971%e6'
});

// Or using connection string:
// REDIS_URL=redis://:Ilovemywifeandsons1971%e6@afribrok-redis.captain:6379
```

## 📚 Detailed Guide

For complete step-by-step instructions, see:
- **Full Guide**: `docs/CAPROVER-DEPLOYMENT-STEPS.md`
- **Production Checklist**: `docs/PRODUCTION-READINESS-CHECKLIST.md`

## ⚠️ Important Notes

1. **PostgreSQL Password**: Save the password you set - you'll need it for `DATABASE_URL`
2. **PostGIS Extension**: Don't forget to enable PostGIS after PostgreSQL is deployed
3. **Domain DNS**: Make sure your domains point to your CapRover server IP before enabling SSL
4. **Environment Variables**: All placeholder values must be replaced with real credentials
5. **Internal Communication**: Use `.captain` hostnames for inter-service communication

## 🆘 Need Help?

If you get stuck:
1. Check CapRover app logs
2. Verify environment variables are correct
3. Check service connectivity
4. Review the detailed guide: `docs/CAPROVER-DEPLOYMENT-STEPS.md`

