# NextAuth/Keycloak Configuration Audit & Fix Summary

## What Was Wrong

### 1. Missing `events.error` Handler
- **Issue**: NextAuth was throwing `OAuthCallbackError` but the error details (including `cause`) were not being logged
- **Impact**: Made debugging OAuth callback failures very difficult
- **Fix**: Added `events.error` handler to both `web-admin` and `web-marketplace` that logs the full error object including `cause`, `name`, `message`, and `stack`

### 2. Debug Mode Not Enabled in Development
- **Issue**: `debug` was only enabled if `AUTH_DEBUG=true` was explicitly set
- **Impact**: OAuth errors were not being surfaced in development
- **Fix**: Changed to `debug: process.env.NODE_ENV === "development" || ...` so debug is always on in dev

### 3. Environment Variable Validation
- **Issue**: Missing env vars only showed warnings, not errors in development
- **Impact**: Misconfigurations could go unnoticed
- **Fix**: Added strict validation that throws errors in development if required env vars are missing:
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `KEYCLOAK_ISSUER`
  - `KEYCLOAK_CLIENT_ID`

### 4. Role Extraction Not Following Requirements
- **Issue**: Code was checking multiple locations for roles (`resource_access`, etc.) instead of just `realm_access.roles`
- **Impact**: Could cause confusion about where roles come from
- **Fix**: Simplified to only extract from `payload.realm_access.roles` as per requirements

### 5. Layout Components Using Cookie-Based Auth
- **Issue**: `(tenant)/layout.tsx` and `super/layout.tsx` were using `getUserContext()` which reads from cookies, not NextAuth JWT tokens
- **Impact**: After NextAuth login, layouts couldn't read user roles properly
- **Fix**: Updated both layouts to use `getToken` from `next-auth/jwt` to read roles from the NextAuth session

### 6. Marketplace Configuration Missing Validation
- **Issue**: `web-marketplace` NextAuth config had no env validation
- **Impact**: Could fail silently in production
- **Fix**: Added same strict env validation as web-admin

## Minimal Code Changes Made

### apps/web-admin/app/api/auth/[...nextauth]/route.ts
1. Added strict env validation (throws errors in dev)
2. Added `events.error` handler
3. Enabled `debug: true` in development
4. Simplified role extraction to only use `realm_access.roles`
5. Used validated env vars instead of defaults

### apps/web-marketplace/app/api/auth/[...nextauth]/route.ts
1. Added strict env validation (throws errors in dev)
2. Added `events.error` handler
3. Enabled `debug: true` in development
4. Added comments documenting that marketplace is public

### apps/web-admin/app/(tenant)/layout.tsx
1. Replaced `getUserContext()` (cookie-based) with `getToken()` (NextAuth JWT)
2. Reads roles directly from NextAuth token

### apps/web-admin/app/super/layout.tsx
1. Replaced `getUserContext()` (cookie-based) with `getToken()` (NextAuth JWT)
2. Reads roles directly from NextAuth token

## Verification

### ✅ NextAuth Configuration
- Both apps use Keycloak provider with correct issuer format
- `web-admin` uses `KEYCLOAK_CLIENT_ID=web-admin`
- `web-marketplace` uses `KEYCLOAK_CLIENT_ID=web-marketplace`
- Public clients configured correctly (empty secret → undefined)
- Callback path is `/api/auth/callback/keycloak` (matches Keycloak config)

### ✅ Environment Variables
- `NEXTAUTH_URL` validated (http://localhost:3000 for dev, https://admin.afribrok.com for prod)
- `KEYCLOAK_ISSUER` validated (https://keycloak.afribrok.com/realms/afribrok)
- `KEYCLOAK_CLIENT_ID` validated (web-admin or web-marketplace)
- Errors thrown in development if missing

### ✅ Role Decoding
- JWT callback extracts `realm_access.roles` from access token
- Roles exposed on session via session callback
- Roles available in middleware and layouts

### ✅ Route Gating
- Middleware checks for `SUPER_ADMIN` or `TENANT_ADMIN` roles
- Unauthorized users redirected to `/auth/forbidden`
- All routes (except `/login`, `/auth`, `/api/auth`) are protected
- Super admin routes (`/super/**`) require `SUPER_ADMIN` role
- Tenant admin routes require `TENANT_ADMIN` or `AGENT` role

### ✅ Marketplace Public Access
- Marketplace pages do not require authentication for browsing
- NextAuth configured but not enforced for listing views
- Ready for broker login later (BROKER role)

### ✅ Password Reset
- Forgot password page exists at `/auth/forgot-password`
- POSTs to `/v1/auth/password-reset` with `{ email }`
- Backend endpoint is PUBLIC (no auth required)

## Backend Team Requirements

### TODO: Keycloak Admin API Integration

The following must be implemented by the backend team:

#### 1. User Invitation Flow
**Location**: Backend API (not in frontend code)

When SUPER_ADMIN or TENANT_ADMIN invites a user via admin UI:

1. **Backend receives invitation request**:
   - Endpoint: `POST /v1/admin/users/invite` (or similar)
   - Body: `{ email, role: 'TENANT_ADMIN' | 'BROKER', tenantId? }`
   - Requires: Authenticated SUPER_ADMIN or TENANT_ADMIN

2. **Backend uses Keycloak Admin API**:
   - Uses confidential client `core-api` with `client_credentials` grant
   - Calls Keycloak Admin API to:
     - Create user in realm `afribrok`
     - Assign realm role (`TENANT_ADMIN` or `BROKER`)
     - Set required actions: `VERIFY_EMAIL` + `UPDATE_PASSWORD`
     - Execute `execute-actions-email` to send password setup email

3. **User receives email**:
   - Email contains link to set password
   - After setting password, user can log in via NextAuth

**Documentation**: See comments in `apps/web-admin/app/(tenant)/users/page.tsx` (if exists)

#### 2. Password Reset Endpoint
**Location**: Backend API

**Endpoint**: `POST /v1/auth/password-reset`
- **Public**: No authentication required
- **Body**: `{ email: string }`
- **Action**: 
  - Uses Keycloak Admin API (confidential client `core-api`)
  - Calls `execute-actions-email` with `UPDATE_PASSWORD` action
  - Sends password reset email to user

**Status**: ✅ Frontend already implemented at `/auth/forgot-password`
- Frontend POSTs to `/v1/auth/password-reset`
- Backend must implement this endpoint

#### 3. Keycloak Client Configuration

**Required Keycloak clients**:

1. **web-admin** (Public)
   - Valid Redirect URIs:
     - `http://localhost:3000/api/auth/callback/keycloak`
     - `https://admin.afribrok.com/api/auth/callback/keycloak`
   - Web Origins:
     - `http://localhost:3000`
     - `https://admin.afribrok.com`
   - Access Type: **Public**

2. **web-marketplace** (Public)
   - Valid Redirect URIs:
     - `http://localhost:3001/api/auth/callback/keycloak`
     - `https://market.afribrok.com/api/auth/callback/keycloak`
   - Web Origins:
     - `http://localhost:3001`
     - `https://market.afribrok.com`
   - Access Type: **Public**

3. **core-api** (Confidential)
   - Used by backend for Keycloak Admin API calls
   - Requires client secret
   - Access Type: **Confidential**

## Testing Checklist

- [ ] SUPER_ADMIN can log into web-admin at http://localhost:3000
- [ ] After login, SUPER_ADMIN is redirected to `/super` dashboard
- [ ] TENANT_ADMIN can log into web-admin
- [ ] After login, TENANT_ADMIN sees tenant dashboard (not super admin)
- [ ] Unauthorized users are redirected to `/auth/forbidden`
- [ ] Marketplace pages are accessible without authentication
- [ ] Password reset form submits to `/v1/auth/password-reset`
- [ ] Error logs show full OAuth error details (including `cause`) when login fails

## Expected Behavior After Fixes

1. **SUPER_ADMIN Login Flow**:
   - User clicks "Sign In with Keycloak" at http://localhost:3000
   - Redirected to Keycloak login
   - After successful login, redirected back to `/api/auth/callback/keycloak`
   - NextAuth processes callback, extracts roles from `realm_access.roles`
   - User redirected to `/super` (super admin dashboard)
   - No OAuthCallbackError

2. **Error Handling**:
   - If OAuth callback fails, `events.error` handler logs full error details
   - Error includes `cause` property showing root cause
   - Debug logs show all OAuth flow steps
   - User sees helpful error message at `/auth/error`

3. **Environment Validation**:
   - If required env vars missing in development, app fails to start with clear error
   - Production uses fallback values with warnings

## Files Modified

1. `apps/web-admin/app/api/auth/[...nextauth]/route.ts` - Added events.error, env validation, debug mode
2. `apps/web-marketplace/app/api/auth/[...nextauth]/route.ts` - Added events.error, env validation, debug mode
3. `apps/web-admin/app/(tenant)/layout.tsx` - Switched to NextAuth JWT tokens
4. `apps/web-admin/app/super/layout.tsx` - Switched to NextAuth JWT tokens

## Next Steps

1. **Test locally**: Run `pnpm dev` in `apps/web-admin` and verify SUPER_ADMIN can log in
2. **Check error logs**: If login fails, check terminal for `[NextAuth] error event` logs showing full error details
3. **Verify Keycloak config**: Ensure redirect URIs match exactly in Keycloak Admin Console
4. **Backend implementation**: Backend team must implement user invitation and password reset endpoints

