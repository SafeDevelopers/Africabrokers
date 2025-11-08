# Core API Deployment Readiness Checklist

## ✅ Pre-Deployment Verification

### Code Status
- ✅ **Build succeeds**: TypeScript compiles without errors
- ✅ **dist/main.js exists**: Application is built and ready
- ✅ **No uncommitted changes**: All changes are committed
- ✅ **Git branch**: `main` (ready for deployment)

### Dockerfile Configuration
- ✅ **EXPOSE 8080**: Container port matches CapRover requirement
- ✅ **ENV PORT=8080**: Application port configured correctly
- ✅ **Health check**: `/healthz` endpoint configured
- ✅ **CMD**: `node dist/main.js` - correct entry point
- ✅ **Multi-stage build**: Optimized for production

### CapRover Configuration
- ✅ **captain-definition**: Present and configured
- ✅ **Dockerfile path**: `./Dockerfile` (correct)
- ✅ **PORT env var**: Set to `8080` in captain-definition

### Application Features
- ✅ **Server binding**: Listens on `0.0.0.0:8080` (accessible from CapRover)
- ✅ **Health endpoint**: `/healthz` returns JSON with version and uptime
- ✅ **Readiness endpoint**: `/readiness` checks DB and Redis connectivity
- ✅ **Status endpoint**: `/v1/_status` accessible to SUPER_ADMIN
- ✅ **JSON responses**: All `/v1/*` routes return JSON only
- ✅ **Error handling**: Global exception filter returns JSON errors
- ✅ **Environment validation**: Checks required env vars on startup

### Security & Configuration
- ✅ **CORS**: Configured for production domains
- ✅ **JWT auth**: Middleware configured
- ✅ **Tenant context**: Middleware configured
- ✅ **RBAC guards**: Role-based access control implemented

## 🚀 Ready to Deploy!

### Deployment Steps

1. **Add Deploy Key to GitHub** (if not done):
   - Go to GitHub → Repository → Settings → Deploy keys
   - Add public key: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOE6GlzVXHDi5o/JkDvkN0IdJX2fj+qWL2GqYz4apLYT caprover-deploy-key`

2. **Add Deploy Key to CapRover** (if not done):
   - CapRover Dashboard → Settings → Deploy Keys
   - Add private key from `~/.ssh/caprover_deploy_key`

3. **Deploy App in CapRover**:
   - Apps → One-Click Apps/Dockerfile → Deploy from GitHub
   - **App Name**: `core-api`
   - **Repository URL**: `git@github.com:YOUR_USERNAME/YOUR_REPO.git`
   - **Branch**: `main`
   - **Dockerfile Path**: `services/core-api/Dockerfile`
   - **Context Path**: `/`
   - **Deploy Key**: Select the key you added

4. **Configure HTTP Settings**:
   - **Container Port**: `8080`
   - **Health Check Path**: `/healthz`

5. **Set Environment Variables** (see DEPLOY-API-caprover.md for full list):
   - `PORT=8080`
   - `DATABASE_URL=postgresql://postgres:PASSWORD@postgres.captain:5432/postgres`
   - `REDIS_URL=redis://redis.captain:6379`
   - Plus all other required variables

6. **Configure Domain**:
   - **Custom Domain**: `api.afribrok.com`
   - **Force HTTPS**: Enabled
   - **Let's Encrypt SSL**: Enabled

7. **Run Database Migrations** (after deployment):
   - CapRover Terminal: `npx prisma migrate deploy`

8. **Verify Deployment**:
   ```bash
   curl https://api.afribrok.com/healthz
   # Expected: {"ok":true,"version":"...","uptimeSec":...}
   ```

## 📋 Post-Deployment Checklist

- [ ] App status shows "Running" in CapRover
- [ ] Health endpoint returns 200: `curl https://api.afribrok.com/healthz`
- [ ] Readiness endpoint returns 200: `curl https://api.afribrok.com/readiness`
- [ ] Database migrations completed: `npx prisma migrate deploy`
- [ ] App logs show no errors
- [ ] SSL certificate is active (HTTPS works)
- [ ] Domain resolves correctly

## ⚠️ Important Notes

1. **Environment Variables**: All required env vars must be set before deployment
2. **Database**: PostgreSQL must be running and accessible via internal hostname
3. **Redis**: Redis must be running and accessible via internal hostname
4. **DNS**: Domain DNS must point to CapRover server before enabling SSL
5. **Migrations**: Run `npx prisma migrate deploy` after first deployment

## 🎉 Status: READY TO DEPLOY!

All checks passed. The core-api is ready for CapRover deployment.

