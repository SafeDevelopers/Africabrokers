# Complete Environment Variables Guide

This document provides the complete environment variable configuration for all apps in CapRover.

## 📋 Quick Reference

| App | Domain | Port | Environment Variables |
|-----|--------|------|----------------------|
| `core-api` | `api.afribrok.com` | 4000 | See below |
| `web-admin` | `admin.afribrok.com` | 3004 | See below |
| `web-marketplace` | `afribrok.com` | 3003 | See below |
| `media-service` | (internal) | 3001 | See below |

---

## 🔧 Core API (`core-api`)

**Domain:** `api.afribrok.com`  
**HTTP Port (CapRover):** `8080` (or any port)  
**Container Port:** `4000` (must match PORT env var)

### Environment Variables

```bash
# ============================================
# Core Configuration
# ============================================
NODE_ENV=production
PORT=4000

# ============================================
# Database (You already added this)
# ============================================
# Replace YOUR_POSTGRES_PASSWORD with the password you set when creating PostgreSQL
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@postgres.captain:5432/postgres

# ============================================
# Redis (You already added this)
# ============================================
# If Redis has NO password:
REDIS_URL=redis://redis.captain:6379

# If Redis has a password (recommended):
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis.captain:6379

# Alternative hostname format (if your Redis app is named differently):
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@afribrok-redis.captain:6379
# REDIS_URL=redis://:YOUR_REDIS_PASSWORD@srv-captain--redis:6379

# ============================================
# Object Storage (S3-compatible) - REQUIRED
# ============================================
# Replace with your actual S3 credentials
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=afribrok-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# ============================================
# OIDC Authentication - REQUIRED
# ============================================
# Replace with your OIDC provider details (Keycloak, Auth0, etc.)
OIDC_ISSUER_URL=https://auth.afribrok.com
OIDC_CLIENT_ID=your-oidc-client-id
OIDC_CLIENT_SECRET=your-oidc-client-secret

# ============================================
# Telebirr Payment Gateway (Sandbox) - REQUIRED
# ============================================
# Replace with your Telebirr sandbox credentials
TELEBIRR_SANDBOX_API_KEY=your-telebirr-api-key
TELEBIRR_SANDBOX_SECRET=your-telebirr-secret

# ============================================
# CORS Configuration (Optional - defaults work)
# ============================================
# These are optional - the code uses defaults if not set
NEXT_PUBLIC_APP_BASE_URL=https://afribrok.com
ADMIN_BASE_URL=https://admin.afribrok.com
```

### ⚠️ Required Replacements

- `YOUR_POSTGRES_PASSWORD` → The password you set when creating PostgreSQL one-click app
- `YOUR_REDIS_PASSWORD` → The password you set when creating Redis one-click app (if you set one)
- `your-aws-access-key-id` → Your AWS S3 access key ID
- `your-aws-secret-access-key` → Your AWS S3 secret access key
- `your-oidc-client-id` → Your OIDC provider client ID
- `your-oidc-client-secret` → Your OIDC provider client secret
- `your-telebirr-api-key` → Your Telebirr sandbox API key
- `your-telebirr-secret` → Your Telebirr sandbox secret

---

## 🌐 Web Admin (`web-admin`)

**Domain:** `admin.afribrok.com`  
**HTTP Port (CapRover):** `3000` (or any port)  
**Container Port:** `3000` (Next.js default - must match PORT env var)

### Environment Variables

```bash
# ============================================
# Core Configuration
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# Public URLs - REQUIRED
# ============================================
NEXT_PUBLIC_APP_BASE_URL=https://admin.afribrok.com
NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com

# ============================================
# Verify Base URL (Optional)
# ============================================
# This is the base URL for the verification page where QR codes point to
# If not set, defaults to https://verify.afribrok.com
NEXT_PUBLIC_VERIFY_BASE_URL=https://afribrok.com/verify
```

### ⚠️ Required Replacements

- None! These are all set to your production domains.

---

## 🏠 Web Marketplace (`web-marketplace`)

**Domain:** `afribrok.com` (main front page)  
**HTTP Port (CapRover):** `3000` (or any port)  
**Container Port:** `3000` (Next.js default - must match PORT env var)

### Environment Variables

```bash
# ============================================
# Core Configuration
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# Public URLs - REQUIRED
# ============================================
NEXT_PUBLIC_APP_BASE_URL=https://afribrok.com
NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com

# ============================================
# Tenant Configuration - REQUIRED
# ============================================
# Replace with your tenant key (e.g., ethiopia-addis)
NEXT_PUBLIC_TENANT_KEY=ethiopia-addis
```

### ⚠️ Required Replacements

- `ethiopia-addis` → Your actual tenant key (e.g., `ethiopia-addis`, `kenya-nairobi`, etc.)

---

## 📁 Media Service (`media-service`)

**Domain:** (Internal only - no public domain)  
**HTTP Port (CapRover):** `3001` (or any port)  
**Container Port:** `3000` (or `3001` - must match PORT env var)

### Environment Variables

```bash
# ============================================
# Core Configuration
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# Object Storage (S3-compatible) - REQUIRED
# ============================================
# Replace with your actual S3 credentials
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=afribrok-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
```

### ⚠️ Required Replacements

- `your-aws-access-key-id` → Your AWS S3 access key ID (same as core-api)
- `your-aws-secret-access-key` → Your AWS S3 secret access key (same as core-api)

---

## 📝 How to Add Environment Variables in CapRover

1. Go to **CapRover Dashboard** → **Apps**
2. Click on your app (e.g., `core-api`)
3. Click **App Configs**
4. Scroll down to **Environment Variables**
5. Click **Add New Environment Variable**
6. Enter the variable name and value
7. Click **Save & Update**

**Tip:** You can add multiple variables at once by clicking **Add New Environment Variable** multiple times before saving.

---

## ✅ Verification Checklist

After adding all environment variables:

### Core API
- [ ] `DATABASE_URL` is set (you already have this)
- [ ] `REDIS_URL` is set (you already have this)
- [ ] `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `AWS_*` are set
- [ ] `OIDC_*` variables are set
- [ ] `TELEBIRR_*` variables are set

### Web Admin
- [ ] `NEXT_PUBLIC_APP_BASE_URL=https://admin.afribrok.com`
- [ ] `NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com`

### Web Marketplace
- [ ] `NEXT_PUBLIC_APP_BASE_URL=https://afribrok.com`
- [ ] `NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com`
- [ ] `NEXT_PUBLIC_TENANT_KEY` is set to your tenant key

### Media Service
- [ ] `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `AWS_*` are set

---

## 🔐 Security Notes

1. **Never commit environment variables to Git**
2. **Use strong passwords** for PostgreSQL and Redis
3. **Rotate secrets regularly** (especially AWS keys and OIDC secrets)
4. **Use different credentials** for production vs development
5. **Keep backups** of your environment variable configurations

---

## 🆘 Troubleshooting

### App won't start
- Check that all required environment variables are set
- Verify no typos in variable names
- Check CapRover logs: **App** → **App Logs**

### Database connection fails
- Verify `DATABASE_URL` format is correct
- Check PostgreSQL password matches
- Verify `postgres.captain` hostname is correct

### Redis connection fails
- Verify `REDIS_URL` format is correct
- Check Redis password matches (if set)
- Verify `redis.captain` hostname is correct

### API calls fail from frontend
- Verify `NEXT_PUBLIC_CORE_API_BASE_URL` is set correctly
- Check CORS configuration in core-api
- Verify domains match exactly (including https://)

---

## 📚 Additional Resources

- **CapRover Documentation**: https://caprover.com/docs/
- **Environment Variables Guide**: `docs/CAPROVER-DEPLOYMENT-STEPS.md`
- **Routing Verification**: `docs/ROUTING-CONNECTION-VERIFICATION.md`

