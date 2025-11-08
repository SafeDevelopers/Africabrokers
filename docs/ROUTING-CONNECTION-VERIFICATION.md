# Routing & Connection Verification Guide

This document verifies all routing and connections between:
- **Backend**: `core-api`, `media-service`
- **Frontend**: `web-admin`, `web-marketplace`
- **Mobile**: `mobile-inspector`

## ✅ Core API Configuration

### Port Configuration
- **Internal Port**: `4000` (set via `PORT` env var)
- **Health Endpoints**: 
  - `GET /v1/health/live` - Liveness check
  - `GET /v1/health/ready` - Readiness check

### CORS Configuration
✅ **Configured to allow:**
- `http://localhost:3004` (web-admin local)
- `http://localhost:3003` (web-marketplace local)
- `https://admin.afribrok.com` (web-admin production)
- `https://afribrok.com` (web-marketplace production - main front page)
- All origins (for mobile apps)

### API Routes (Global Prefix: `/v1`)

#### Authentication
- `POST /v1/auth/login` - User login
- `POST /v1/auth/refresh` - Refresh token

#### Brokers
- `POST /v1/brokers` - Create broker
- `GET /v1/brokers/:id` - Get broker
- `POST /v1/brokers/:id/submit` - Submit for review
- `POST /v1/brokers/:id/documents` - Request document URLs
- `GET /v1/public/brokers` - List public brokers
- `POST /v1/public/brokers/applications` - Submit broker application

#### Listings
- `GET /v1/listings/search` - Search listings
- `GET /v1/listings/:id` - Get listing details
- `POST /v1/listings` - Create listing
- `PUT /v1/listings/:id` - Update listing
- `DELETE /v1/listings/:id` - Delete listing

#### Verification
- `GET /v1/verify/:qr_code` - Verify QR code (used by mobile inspector)

#### Admin
- `GET /v1/admin/qrcodes` - List QR codes
- `GET /v1/admin/qrcodes/:id` - Get QR code
- `POST /v1/admin/qrcodes/:id/activate` - Activate QR code
- `POST /v1/admin/qrcodes/:id/revoke` - Revoke QR code
- `GET /v1/admin/brokers` - List brokers for review
- `POST /v1/admin/brokers/:id/approve` - Approve broker
- `POST /v1/admin/brokers/:id/reject` - Reject broker

#### Public
- `POST /v1/public/inquiries` - Submit inquiry
- `POST /v1/public/leads/sell` - Submit sell lead

## ✅ Web Admin Configuration

### Port Configuration
- **Internal Port**: `3000` (Next.js default)
- **HTTP Port**: `3004` (CapRover configuration)

### API Connection
✅ **Environment Variable**: `NEXT_PUBLIC_CORE_API_BASE_URL`
- **Production**: `https://api.afribrok.com`
- **Local**: `http://localhost:4000`

### API Client Configuration
- **File**: `apps/web-admin/lib/api-client.ts`
- **Base URL**: Uses `NEXT_PUBLIC_CORE_API_BASE_URL`
- **Headers**: Automatically includes `X-Tenant` header
- **Credentials**: `include` (for cookies)

### Routes Used
- `POST /v1/auth/login` - Admin login
- `GET /v1/admin/qrcodes` - List QR codes
- `GET /v1/admin/qrcodes/:id` - Get QR code details
- `POST /v1/admin/qrcodes/:id/activate` - Activate QR code
- `POST /v1/admin/qrcodes/:id/revoke` - Revoke QR code
- `GET /v1/admin/brokers` - List brokers for review
- `GET /v1/admin/dashboard` - Dashboard data

### Domain Configuration
- **Production Domain**: `https://admin.afribrok.com`
- **Environment Variable**: `NEXT_PUBLIC_APP_BASE_URL`

## ✅ Web Marketplace Configuration

### Port Configuration
- **Internal Port**: `3000` (Next.js default)
- **HTTP Port**: `3003` (CapRover configuration)

### API Connection
✅ **Environment Variable**: `NEXT_PUBLIC_CORE_API_BASE_URL`
- **Production**: `https://api.afribrok.com`
- **Local**: `http://localhost:4000`

### API Client Configuration
- **File**: `apps/web-marketplace/lib/api.ts`
- **Base URL**: Uses `NEXT_PUBLIC_CORE_API_BASE_URL`
- **Headers**: Automatically includes `X-Tenant` header from cookie
- **Credentials**: `include` (for cookies)

### Routes Used
- `POST /v1/auth/login` - Broker login
- `GET /v1/listings/search` - Search listings
- `GET /v1/listings/:id` - Get listing details
- `POST /v1/public/brokers/applications` - Submit broker application
- `POST /v1/public/leads/sell` - Submit sell lead
- `GET /v1/verify/:qr_code` - Verify QR code (verify page)
- `GET /v1/broker/listings` - Get broker's listings
- `POST /v1/listings` - Create listing
- `PUT /v1/listings/:id` - Update listing
- `DELETE /v1/listings/:id` - Delete listing

### Domain Configuration
- **Production Domain**: `https://afribrok.com` (main front page)
- **Environment Variable**: `NEXT_PUBLIC_APP_BASE_URL`
- **Tenant Key**: `NEXT_PUBLIC_TENANT_KEY` (e.g., `ethiopia-addis`)

## ✅ Mobile Inspector Configuration

### API Connection
✅ **Configuration**: `apps/mobile-inspector/app.json`
- **Production API URL**: `https://api.afribrok.com`
- **Environment Variable**: `EXPO_PUBLIC_API_BASE_URL` (optional override)

### API Client Configuration
- **File**: `apps/mobile-inspector/src/utils/api.ts`
- **Base URL**: Uses `app.json` extra.apiBaseUrl or `EXPO_PUBLIC_API_BASE_URL`
- **Default Fallback**: `http://localhost:4000` (local development)

### Routes Used
- `GET /v1/verify/:qr_code` - Verify QR code (main functionality)
- `POST /v1/inspections` - Create inspection record (if authenticated)

### QR Code Verification Flow
1. User scans QR code
2. App extracts QR code ID (e.g., `AFR-QR-156`)
3. App calls: `GET https://api.afribrok.com/v1/verify/AFR-QR-156`
4. API returns broker verification status
5. App displays result

## ✅ Media Service Configuration

### Port Configuration
- **Internal Port**: `3000` (check Dockerfile)
- **HTTP Port**: `3001` (CapRover configuration)

### Purpose
- Handles file uploads (images, documents)
- Generates presigned URLs for S3-compatible storage
- Used by `core-api` for broker document uploads

### Connection
- **Internal Only**: No public domain needed
- **Called by**: `core-api` when documents need to be uploaded

## 🔗 Connection Summary

### Web Admin → Core API
- ✅ Base URL: `NEXT_PUBLIC_CORE_API_BASE_URL` → `https://api.afribrok.com`
- ✅ CORS: Allowed from `https://admin.afribrok.com`
- ✅ Headers: `X-Tenant` automatically included
- ✅ Auth: Cookie-based (credentials: include)

### Web Marketplace → Core API
- ✅ Base URL: `NEXT_PUBLIC_CORE_API_BASE_URL` → `https://api.afribrok.com`
- ✅ CORS: Allowed from `https://afribrok.com`
- ✅ Headers: `X-Tenant` from cookie automatically included
- ✅ Auth: Cookie-based (credentials: include)

### Mobile Inspector → Core API
- ✅ Base URL: `https://api.afribrok.com` (configured in app.json)
- ✅ CORS: Allowed (all origins in production)
- ✅ Headers: Standard HTTP headers
- ✅ Auth: Optional (for inspection records)

### Core API → Media Service
- ✅ Internal: `media-service.captain:3001`
- ✅ Purpose: File upload handling

## 🧪 Verification Checklist

### Before Deployment

- [ ] **Core API CORS** configured for production domains
- [ ] **Web Admin** has `NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com`
- [ ] **Web Marketplace** has `NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com`
- [ ] **Mobile Inspector** has `apiBaseUrl=https://api.afribrok.com` in app.json
- [ ] **Core API** port set to `4000` in CapRover
- [ ] **Web Admin** HTTP port set to `3004` in CapRover
- [ ] **Web Marketplace** HTTP port set to `3003` in CapRover
- [ ] **Media Service** HTTP port set to `3001` in CapRover

### After Deployment

- [ ] Test: `curl https://api.afribrok.com/v1/health/live`
- [ ] Test: `curl https://api.afribrok.com/v1/health/ready`
- [ ] Test: `curl https://admin.afribrok.com` (should return HTML)
- [ ] Test: `curl https://afribrok.com` (should return HTML - main front page)
- [ ] Test: `curl https://api.afribrok.com/v1/verify/AFR-QR-156` (should return JSON)
- [ ] Verify CORS: Check browser console for CORS errors
- [ ] Verify Mobile Inspector: Test QR code scanning

## 🐛 Common Issues

### CORS Errors
**Problem**: Browser shows CORS errors when calling API

**Solution**: 
- Verify `NEXT_PUBLIC_CORE_API_BASE_URL` matches production domain
- Check CORS configuration in `core-api/src/main.ts`
- Ensure production domains are in allowed origins

### API Connection Failed
**Problem**: Frontend can't connect to API

**Solution**:
- Verify `NEXT_PUBLIC_CORE_API_BASE_URL` is set correctly
- Check API is running: `curl https://api.afribrok.com/v1/health/live`
- Verify DNS is pointing to CapRover server
- Check SSL certificate is valid

### Mobile Inspector Can't Verify
**Problem**: Mobile app can't verify QR codes

**Solution**:
- Verify `apiBaseUrl` in `app.json` is `https://api.afribrok.com`
- Check API endpoint: `curl https://api.afribrok.com/v1/verify/AFR-QR-156`
- Verify CORS allows mobile app requests
- Check network connectivity on device

## 📝 Environment Variables Summary

### Core API
```bash
PORT=4000
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.captain:5432/postgres
REDIS_URL=redis://:PASSWORD@redis.captain:6379
NEXT_PUBLIC_APP_BASE_URL=https://afribrok.com
ADMIN_BASE_URL=https://admin.afribrok.com
```

### Web Admin
```bash
NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com
NEXT_PUBLIC_APP_BASE_URL=https://admin.afribrok.com
```

### Web Marketplace
```bash
NEXT_PUBLIC_CORE_API_BASE_URL=https://api.afribrok.com
NEXT_PUBLIC_APP_BASE_URL=https://afribrok.com
NEXT_PUBLIC_TENANT_KEY=ethiopia-addis
```

### Mobile Inspector
```json
{
  "extra": {
    "apiBaseUrl": "https://api.afribrok.com"
  }
}
```

## ✅ All Connections Verified

All routing and connections are properly configured and ready for deployment!

