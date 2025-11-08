# Fix Report - QA Test Results After Remediation

This document reports the results of running QA smoke tests against staging URLs after implementing the fixes from FIX-PLAN.md.

**Test Date**: 2025-11-08  
**Test Environment**: Staging (https://api.afribrok.com, https://admin.afribrok.com, https://afribrok.com)  
**Test Scripts**: `qa/smoke-admin.sh`, `qa/smoke-market.sh`

---

## Test Execution Summary

### smoke-admin.sh Results

**Status**: ❌ FAILED (1 check failed)

**Green Checks** (0):
- None - test failed immediately on first check

**Red Checks** (1):
1. **`_status (SA): /v1/* must return JSON, got 'text/html'`**
   - **URL**: `https://api.afribrok.com/v1/_status`
   - **Method**: GET
   - **Headers**: `Authorization: Bearer <JWT_SUPER_ADMIN>`, `X-Tenant: demo-tenant`
   - **Expected**: `Content-Type: application/json`, Status: 200
   - **Actual**: `Content-Type: text/html`, Status: 502
   - **Response Body**: NGINX 502 Bad Gateway error page (HTML)
   - **Issue**: Backend service not running or not responding - CapRover/NGINX returning 502 error page
   - **Stack Trace**: N/A (infrastructure error, not application error)

**Additional Checks Not Reached**:
- Admin page checks (not reached due to early failure)
- RBAC checks for TENANT_ADMIN vs SUPER_ADMIN (not reached)
- Preflight OPTIONS checks (not reached)

### smoke-market.sh Results

**Status**: ❌ FAILED (5 checks failed)

**Green Checks** (0):
- None - all checks failed

**Red Checks** (5):

1. **`page / status=000`**
   - **URL**: `https://afribrok.com/`
   - **Error**: `curl: (6) Could not resolve host: afribrok.com`
   - **Issue**: Domain does not resolve (DNS issue or not deployed)

2. **`page /search?q=verified status=000`**
   - **URL**: `https://afribrok.com/search?q=verified`
   - **Error**: `curl: (6) Could not resolve host: afribrok.com`
   - **Issue**: Domain does not resolve (DNS issue or not deployed)

3. **`page /listings status=000`**
   - **URL**: `https://afribrok.com/listings`
   - **Error**: `curl: (6) Could not resolve host: afribrok.com`
   - **Issue**: Domain does not resolve (DNS issue or not deployed)

4. **`page /listings/sample-listing status=000`**
   - **URL**: `https://afribrok.com/listings/sample-listing`
   - **Error**: `curl: (6) Could not resolve host: afribrok.com`
   - **Issue**: Domain does not resolve (DNS issue or not deployed)

5. **`broker inquiries (BROKER): /v1/* must return JSON, got 'text/html'`**
   - **URL**: `https://api.afribrok.com/v1/broker/inquiries`
   - **Method**: GET
   - **Headers**: `Authorization: Bearer <JWT_BROKER>`, `X-Tenant: demo-tenant`
   - **Expected**: `Content-Type: application/json`, Status: 200
   - **Actual**: `Content-Type: text/html`, Status: 502
   - **Response Body**: NGINX 502 Bad Gateway error page (HTML)
   - **Issue**: Backend service not running or not responding - CapRover/NGINX returning 502 error page
   - **Stack Trace**: N/A (infrastructure error, not application error)

**Additional Checks Not Reached**:
- Marketplace listings structure check (not reached due to early failure)
- Preflight OPTIONS checks (not reached)

---

## Analysis

### Issues Identified

1. **API Endpoints Returning 502 Bad Gateway (HTML Error Page)**
   - **Affected Endpoints**:
     - `GET /v1/_status` (with SUPER_ADMIN token) - Returns 502
     - `GET /v1/broker/inquiries` (with BROKER token) - Returns 502
     - `OPTIONS /v1/admin/reviews/pending` - Returns 502
   - **Root Cause**: Backend service (`core-api`) is not running or not responding. CapRover/NGINX is returning a 502 Bad Gateway error page (HTML) instead of routing to the application.
   - **Expected Behavior**: Backend service should be running and responding with `Content-Type: application/json` and JSON body
   - **Evidence**: Response contains "NGINX 502 Error :/" HTML page with CapRover troubleshooting link

2. **Domain Resolution Failures**
   - **Affected Domains**: `afribrok.com`
   - **Root Cause**: Domain not deployed or DNS not configured
   - **Expected Behavior**: Domain should resolve and return HTTP responses

### Tests That Could Not Run

Due to early failures, the following checks were not executed:
- RBAC validation (TENANT_ADMIN vs SUPER_ADMIN access patterns)
- Preflight OPTIONS requests for CORS
- Marketplace listings structure validation (`{items, count}` format)
- Admin page rendering checks

---

## Next Minimal Actions

### Priority 1: Fix Backend Service Availability

**Action**: Ensure `core-api` service is running and responding in CapRover

**Infrastructure Checks**:
1. Verify `core-api` app is deployed and running in CapRover
2. Check CapRover app logs for `core-api` to identify startup errors
3. Verify environment variables are set correctly in CapRover
4. Verify database connection (`DATABASE_URL`) is accessible
5. Verify Redis connection (`REDIS_URL`) is accessible
6. Check if service is listening on the correct port (4000)

**Application Checks** (after service is running):
- Verify `HttpExceptionFilter` sets `Content-Type: application/json` for all `/v1/*` routes
- Verify `JsonResponseInterceptor` is applied globally and sets Content-Type header
- Verify `/_status` endpoint exists and returns JSON format
- Verify error responses (404, 500) return JSON, not HTML

### Priority 2: Verify Domain Deployment

**Action**: Confirm staging domains are deployed and DNS is configured

**Check**:
- Verify `afribrok.com` DNS records point to CapRover server
- Verify `admin.afribrok.com` DNS records point to CapRover server
- Verify `api.afribrok.com` DNS records point to CapRover server
- Check CapRover app status for all three apps

### Priority 3: Re-run Tests After Fixes

**Action**: After fixing Priority 1 issues, re-run smoke tests to verify:
- All `/v1/*` endpoints return JSON
- RBAC checks pass (TENANT_ADMIN vs SUPER_ADMIN)
- Preflight OPTIONS requests succeed
- Marketplace listings return `{items, count}` structure

---

## Notes

- **JWT Tokens**: The test uses placeholder JWT tokens (`eyJ...sa`, `eyJ...ta`, `eyJ...br`). These need to be replaced with valid tokens for actual testing.
- **Tenant**: Test uses `demo-tenant` - verify this tenant exists in staging database
- **Bash Compatibility**: Fixed `${ctype,,}` syntax issue by using `tr '[:upper:]' '[:lower:]'` for macOS/bash 3.2 compatibility

---

## Test Script Improvements Made

1. ✅ Fixed bash compatibility issue (`${ctype,,}` → `tr '[:upper:]' '[:lower:]'`)
2. ✅ Added strict JSON content-type checking for `/v1/*` endpoints
3. ✅ Added HTML detection in response bodies
4. ✅ Added RBAC validation checks (TENANT_ADMIN vs SUPER_ADMIN)
5. ✅ Added preflight OPTIONS checks
6. ✅ Added marketplace listings structure validation

---

## Conclusion

The smoke tests are now properly configured to detect:
- Non-JSON responses from `/v1/*` endpoints
- HTML responses where JSON is expected
- RBAC violations
- Missing response structure (`{items, count}`)

However, the tests cannot complete successfully until:
1. API endpoints return JSON instead of HTML
2. Staging domains are properly deployed and DNS-configured
3. Valid JWT tokens are provided in the test environment file

