# Deploy Core API to CapRover - Step by Step

This guide walks through deploying the `core-api` service to CapRover.

## Prerequisites

- ✅ CapRover server is running and accessible
- ✅ DNS records for `api.afribrok.com` point to CapRover server IP
- ✅ PostgreSQL app is created in CapRover (with PostGIS enabled)
- ✅ Redis app is created in CapRover
- ✅ All environment variables are ready

## Step 1: Verify Dockerfile Configuration

The Dockerfile is already configured correctly:
- ✅ **EXPOSE 8080** - Container port
- ✅ **ENV PORT=8080** - Application port
- ✅ **Health check**: `/healthz` endpoint
- ✅ **CMD**: `node dist/main.js`

**No changes needed** - Dockerfile is production-ready.

## Step 2: Run Setup Script (REQUIRED)

**IMPORTANT**: Before deploying, you must run the setup script to create/update captain-definition files:

```bash
./set-captain-definition.sh
```

This script creates:
- **Root `captain-definition`** file (required by CapRover Method 2) pointing to `./services/core-api/Dockerfile`
- Subdirectory captain-definition files for reference

**Note**: CapRover Method 2 looks for `captain-definition` in the **root of the repository**, so the root file is essential.

## Step 3: Create/Update Core API App in CapRover

### Option A: Deploy from GitHub/Bitbucket/GitLab (Method 3)

When using **Method 3: Deploy from GitHub/Bitbucket/GitLab**, CapRover will use the `captain-definition` file. The form fields you see may vary, but here's what to fill:

1. Go to CapRover Dashboard → **Apps** → **One-Click Apps/Dockerfile**
2. Click **Deploy from GitHub/Bitbucket/GitLab** (Method 3)
3. Configure the form:
   - **App Name**: `core-api`
   - **Repository URL**: `git@github.com:YOUR_USERNAME/YOUR_REPO.git` (SSH format)
   - **Branch**: `main` (or your deployment branch)
   - **Deploy Key**: Select the deploy key you added to CapRover
   - **User/Password**: Leave empty (using deploy key)
   
   **If you see these fields, fill them:**
   - **Path to Captain Definition** (or **Captain Definition Path**): `services/core-api/captain-definition`
   - **Dockerfile Path**: Leave empty (set in captain-definition)
   - **Context Path**: Leave empty (set in captain-definition)
   
   **If you DON'T see "Path to Captain Definition" field:**
   - CapRover looks for `captain-definition` in the root of the repository by default
   - Since our captain-definition is in `services/core-api/`, we need to either:
     - **Option 1**: Use Method 2 (Deploy from Dockerfile) instead - see Option B below
     - **Option 2**: Check if there's a "Subdirectory" or "Path" field in the form
     - **Option 3**: Put captain-definition in the root (not recommended for multiple apps)
   
4. Click **Deploy**

**Important**: 
- The `captain-definition` file at `services/core-api/captain-definition` contains:
  - `dockerfilePath: "./Dockerfile"` (relative to `services/core-api/`)
  - `contextPath: "/"` (root of repository)
  - `envVars.PORT: "8080"`
- Make sure you ran `./set-captain-definition.sh` before pushing to GitHub
- The file must be committed and pushed to the branch you're deploying

**Troubleshooting**: If CapRover can't find the captain-definition file:
1. Check that `services/core-api/captain-definition` exists in your repository
2. Try specifying the path explicitly if there's a "Path to Captain Definition" field
3. Check CapRover logs for the exact error message

### Option B: Deploy from Dockerfile (Method 2) - RECOMMENDED

If Method 3 doesn't work because CapRover can't find the captain-definition file in a subdirectory, use **Method 2: Deploy from Dockerfile** instead. This method allows you to specify the Dockerfile path directly.

1. Go to CapRover Dashboard → **Apps** → **One-Click Apps/Dockerfile**
2. Click **Deploy from Dockerfile** (Method 2)
3. Configure:
   - **App Name**: `core-api`
   - **Repository URL**: `git@github.com:YOUR_USERNAME/YOUR_REPO.git` (SSH format)
   - **Branch**: `main` (or your deployment branch)
   - **Dockerfile Path**: `services/core-api/Dockerfile` ✅
   - **Context Path**: `/` (root of repository) ✅
   - **Deploy Key**: Select the deploy key you added to CapRover
4. Click **Deploy**

**Note**: 
- This method directly specifies the Dockerfile path, so CapRover doesn't need to find captain-definition
- The context path `/` means CapRover will use the root of the repository as the build context
- The Dockerfile at `services/core-api/Dockerfile` will be used, and it will have access to the entire repository root

## Step 4: Configure HTTP Settings

Go to `core-api` app → **App Configs** → **HTTP Settings**:

- **Container Port**: `8080` ✅ (matches Dockerfile EXPOSE)
- **HTTP Port**: `80` (or any port, CapRover will handle routing)
- **HTTPS Port**: `443` (or any port, CapRover will handle routing)
- **Health Check Path**: `/healthz` ✅
- **Health Check Port**: `8080` (matches Container Port)

**Important**: Container Port must be `8080` to match the Dockerfile.

## Step 5: Configure Custom Domain

Go to `core-api` app → **App Configs** → **Custom Domain**:

1. Add domain: `api.afribrok.com`
2. ✅ **Enable "Force HTTPS by redirecting all HTTP traffic to HTTPS"**
3. ✅ **Enable "Use Let's Encrypt to get a free SSL certificate"**

**Note**: DNS must be configured before enabling SSL.

## Step 6: Set Environment Variables

Go to `core-api` app → **App Configs** → **Environment Variables**:

### Required Variables

```bash
# Node Environment
NODE_ENV=production

# Server Port (must match Container Port)
PORT=8080

# Database Connection (use internal CapRover hostname)
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@postgres.captain:5432/postgres
# Or if your PostgreSQL app is named differently:
# DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@afribrok-db.captain:5432/postgres

# Redis Connection (use internal CapRover hostname)
REDIS_URL=redis://redis.captain:6379
# Or if Redis has a password:
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis.captain:6379
# Or if your Redis app is named differently:
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@afribrok-redis.captain:6379

# OIDC / Keycloak Configuration
OIDC_ISSUER_URL=https://keycloak.example.com/realms/afribrok
OIDC_CLIENT_ID=afribrok-api
OIDC_CLIENT_SECRET=your-oidc-client-secret

# AWS S3 Storage Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=afribrok-media

# Telebirr Payment Integration
TELEBIRR_SANDBOX_API_KEY=your-telebirr-api-key
TELEBIRR_SANDBOX_SECRET=your-telebirr-secret

# JWT Secret (CHANGE FROM DEFAULT!)
JWT_SECRET=your-production-jwt-secret-change-this

# CSRF Secret (CHANGE FROM DEFAULT!)
CSRF_SECRET=your-production-csrf-secret-change-this
```

### Recommended Variables

```bash
# CORS Allowed Origins (comma-separated)
CORS_ALLOWED_ORIGINS=https://admin.afribrok.com,https://afribrok.com,https://market.afribrok.com

# JWT Verification Settings
JWT_ISSUER=your-jwt-issuer
JWT_AUDIENCE=your-jwt-audience

# Version Metadata
GIT_SHA=your-git-sha
VERSION=1.0.0
APP_VERSION=1.0.0
```

**Important**: Replace all placeholder values with actual credentials.

## Step 7: Run Database Migrations

After the app is deployed, run Prisma migrations:

1. Go to `core-api` app → **App Configs** → **Terminal**
2. Run:
   ```bash
   cd /app
   npx prisma migrate deploy
   ```

Or via SSH:
```bash
# Find container
docker ps | grep core-api

# Connect to container
docker exec -it <core-api-container-name> sh

# Run migrations
cd /app
npx prisma migrate deploy
```

## Step 8: Verify Deployment

### Check App Status

1. Go to CapRover Dashboard → **Apps** → `core-api`
2. Verify status is **"Running"** ✅
3. Check **App Logs** for any errors

### Test Health Endpoint

```bash
# Test health endpoint (should return 200 JSON)
curl -i https://api.afribrok.com/healthz

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: application/json
# {"ok":true,"version":"1.0.0","uptimeSec":123}
```

### Test Readiness Endpoint

```bash
# Test readiness endpoint (should return 200 JSON if DB/Redis are connected)
curl -i https://api.afribrok.com/readiness

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: application/json
# {"ok":true,"db":true,"redis":true,"status":"UP",...}
```

### Test Status Endpoint (requires auth)

```bash
# Test status endpoint (requires SUPER_ADMIN token)
curl -i https://api.afribrok.com/v1/_status \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "X-Tenant: your-tenant-id"

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: application/json
# {"services":{...},"version":"1.0.0","time":"2025-11-08T..."}
```

## Step 8: Troubleshooting

### App Won't Start

1. Check **App Logs** in CapRover
2. Verify all required environment variables are set
3. Verify database connection:
   - Check `DATABASE_URL` format
   - Verify PostgreSQL is running
   - Test connection: `psql $DATABASE_URL`
4. Verify Redis connection:
   - Check `REDIS_URL` format
   - Verify Redis is running

### Health Check Failing

1. Verify Container Port is `8080`
2. Verify Health Check Path is `/healthz`
3. Check app logs for startup errors
4. Test manually: `curl http://localhost:8080/healthz` (from inside container)

### 502 Bad Gateway

1. Check if app is running: CapRover Dashboard → Apps → core-api
2. Check app logs for errors
3. Verify Container Port matches `PORT` environment variable
4. Verify app is listening on `0.0.0.0:8080` (not `127.0.0.1`)

### Database Connection Errors

1. Verify `DATABASE_URL` uses internal CapRover hostname:
   - ✅ `postgres.captain:5432` (or `afribrok-db.captain:5432`)
   - ❌ `localhost:5432` (won't work in CapRover)
2. Verify PostgreSQL app is running
3. Verify password is correct
4. Test connection from CapRover terminal

### Redis Connection Errors

1. Verify `REDIS_URL` uses internal CapRover hostname:
   - ✅ `redis.captain:6379` (or `afribrok-redis.captain:6379`)
   - ❌ `localhost:6379` (won't work in CapRover)
2. Verify Redis app is running
3. Verify password is correct (if using password)

## Step 9: Monitor and Maintain

### View Logs

- **CapRover Dashboard**: Apps → core-api → App Logs
- **SSH**: `docker logs <core-api-container-name> -f`

### Restart App

- **CapRover Dashboard**: Apps → core-api → Restart
- **SSH**: `docker restart <core-api-container-name>`

### Update App

1. Push changes to GitHub (or rebuild Dockerfile)
2. CapRover will automatically rebuild and redeploy
3. Or manually trigger: Apps → core-api → Redeploy

## Summary

✅ **Container Port**: `8080` (matches Dockerfile)  
✅ **Health Check Path**: `/healthz`  
✅ **Domain**: `api.afribrok.com`  
✅ **Force HTTPS**: Enabled  
✅ **SSL**: Let's Encrypt enabled  
✅ **Environment Variables**: All required vars set  
✅ **Database Migrations**: Run after deployment  

The API should now be accessible at `https://api.afribrok.com` with health checks working.

