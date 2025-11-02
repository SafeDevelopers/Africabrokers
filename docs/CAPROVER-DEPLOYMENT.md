# CapRover Deployment Guide

This guide covers deploying AfriBrok to CapRover on a Contabo VPS server.

## Prerequisites

- Contabo VPS server with Ubuntu 20.04+
- Domain name pointing to your server IP
- CapRover installed on your server

## CapRover Installation

If CapRover is not already installed:

```bash
# SSH into your server
ssh root@your-server-ip

# Install CapRover
docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

Then access CapRover at `http://your-server-ip:3000` and complete setup.

## Domain Configuration

1. Point your domain DNS to your server IP:
   - `api.afribrok.com` → Server IP
   - `marketplace.afribrok.com` → Server IP  
   - `admin.afribrok.com` → Server IP

2. In CapRover dashboard:
   - Go to Apps → One-Click Apps/Dockerfile
   - Enable HTTPS (Let's Encrypt) for each app

## Deployment Steps

### 1. Build and Push Docker Images

```bash
# Build images
cd /Users/deldil/Desktop/Africabrockers

# Build core-api
docker build -t afribrok/core-api:latest -f services/core-api/Dockerfile .

# Build media-service
docker build -t afribrok/media-service:latest -f services/media-service/Dockerfile .

# Build web-admin
docker build -t afribrok/web-admin:latest -f apps/web-admin/Dockerfile .

# Build web-marketplace
docker build -t afribrok/web-marketplace:latest -f apps/web-marketplace/Dockerfile .
```

### 2. Deploy to CapRover

#### Option A: Using CapRover Dashboard

1. **Create Apps in CapRover:**
   - `afribrok-api` (core-api service)
   - `afribrok-media` (media-service)
   - `afribrok-admin` (web-admin app)
   - `afribrok-marketplace` (web-marketplace app)

2. **For each app:**
   - Go to App Configs
   - Add Dockerfile path or use Image Name
   - Configure environment variables (see below)
   - Set HTTP Port: 80
   - Enable HTTPS with Let's Encrypt

#### Option B: Using Captain Definition File

Create `captain-definition` files for each service:

**services/core-api/captain-definition:**
```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

**apps/web-admin/captain-definition:**
```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

### 3. Environment Variables

Set these in CapRover for each app:

#### Core API (`afribrok-api`)
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@postgres-host:5432/afribrok
REDIS_URL=redis://redis-host:6379
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=afribrok-uploads
OIDC_ISSUER_URL=https://auth.afribrok.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
```

#### Web Admin (`afribrok-admin`)
```
NODE_ENV=production
PORT=3004
NEXT_PUBLIC_APP_BASE_URL=https://admin.afribrok.com
```

#### Web Marketplace (`afribrok-marketplace`)
```
NODE_ENV=production
PORT=3003
NEXT_PUBLIC_APP_BASE_URL=https://marketplace.afribrok.com
NEXT_PUBLIC_TENANT_KEY=ethiopia-addis
```

#### Media Service (`afribrok-media`)
```
NODE_ENV=production
PORT=3001
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=afribrok-uploads
```

### 4. Database Setup

#### Option A: CapRover One-Click App (PostgreSQL)
1. In CapRover: Apps → One-Click Apps → PostgreSQL
2. Set app name: `afribrok-db`
3. Configure password
4. Update `DATABASE_URL` in core-api with:
   `postgresql://postgres:password@afribrok-db.captain:5432/postgres`

#### Option B: External Managed Database
Use a managed PostgreSQL service and update `DATABASE_URL`.

### 5. Redis Setup

#### Option A: CapRover One-Click App
1. Apps → One-Click Apps → Redis
2. Set app name: `afribrok-redis`
3. Update `REDIS_URL` in core-api with:
   `redis://afribrok-redis.captain:6379`

### 6. Run Database Migrations

```bash
# SSH into server and connect to core-api container
docker exec -it afribrok-api.1.<container-id> sh

# Run migrations
cd /app
pnpm prisma migrate deploy

# Seed database (optional)
pnpm db:seed
```

### 7. Mobile Inspector Configuration

Update `apps/mobile-inspector/app.json`:

```json
{
  "extra": {
    "apiBaseUrl": "https://api.afribrok.com"
  }
}
```

Or set `EXPO_PUBLIC_API_BASE_URL=https://api.afribrok.com` in your `.env` file.

## Networking in CapRover

CapRover apps can communicate using:
- App names as hostnames: `http://afribrok-api:4000`
- Captain network for inter-container communication

## Monitoring

CapRover provides:
- Built-in logs viewer
- Resource monitoring
- Automatic restarts
- Health checks

## Troubleshooting

### App won't start
- Check logs in CapRover dashboard
- Verify environment variables
- Check Dockerfile paths

### Database connection issues
- Verify `DATABASE_URL` format
- Check network connectivity between apps
- Ensure database is accessible

### Mobile app can't reach API
- Verify API URL in app.json
- Check CORS settings in core-api
- Ensure HTTPS is configured correctly

## Backup Strategy

CapRover includes backup features:
- Enable automatic backups in Settings
- Backup to S3 or local storage
- Schedule regular backups

## Scaling

To scale an app in CapRover:
1. Go to App Configs
2. Increase instance count
3. CapRover will automatically load balance

## SSL Certificates

CapRover automatically handles SSL with Let's Encrypt:
1. Enable HTTPS in App Configs
2. Enter domain name
3. CapRover handles certificate generation and renewal

## Mobile Inspector Build

For production mobile builds:

```bash
cd apps/mobile-inspector

# Install EAS CLI
npm install -g eas-cli

# Configure API URL
# Update app.json extra.apiBaseUrl to production API URL

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

## Quick Reference

### CapRover App URLs
- API: `https://api.afribrok.com` (port 4000 internal)
- Admin: `https://admin.afribrok.com` (port 3004 internal)
- Marketplace: `https://marketplace.afribrok.com` (port 3003 internal)
- Media: Internal only (port 3001)

### Internal Service Names
- Database: `afribrok-db.captain`
- Redis: `afribrok-redis.captain`
- API: `afribrok-api.captain`
- Media: `afribrok-media.captain`

## Support

For issues:
- Check CapRover logs
- Review application logs
- Verify environment variables
- Check network connectivity

