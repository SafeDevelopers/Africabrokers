# Troubleshooting "Try signing in with a different account" Error

## What This Error Means

The "Try signing in with a different account" message is a generic NextAuth error that appears when there's an OAuth callback failure. The actual error is usually one of these:

1. **Redirect URI Mismatch** - Most common cause
2. **NEXTAUTH_URL Configuration Issue**
3. **Keycloak Client Configuration**
4. **Network/CORS Issues**

## Step-by-Step Debugging

### 1. Check Server Logs

When you try to sign in, check the terminal where `pnpm dev` is running. You should now see detailed error messages like:

```
[NextAuth][error] OAUTH_CALLBACK_ERROR { ... }
[NextAuth] OAuth Callback Error Details: { ... }
```

Look for:
- `error`: The specific OAuth error code
- `errorDescription`: Detailed description from Keycloak
- `url`: The callback URL that failed

### 2. Verify Environment Variables

Create/check `.env.local` in `apps/web-admin/`:

```bash
# Must be exactly http://localhost:3000 (not 127.0.0.1)
NEXTAUTH_URL=http://localhost:3000

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here

# Keycloak configuration
KEYCLOAK_ISSUER=https://keycloak.afribrok.com/realms/afribrok
KEYCLOAK_CLIENT_ID=web-admin
KEYCLOAK_CLIENT_SECRET=
```

**Critical:** `NEXTAUTH_URL` must match exactly:
- ✅ `http://localhost:3000` (correct)
- ❌ `http://127.0.0.1:3000` (wrong)
- ❌ `https://localhost:3000` (wrong for local dev)

### 3. Configure Keycloak Client

In Keycloak Admin Console:

1. Go to **Clients** → **web-admin** → **Settings**

2. **Valid Redirect URIs** - Must include:
   ```
   http://localhost:3000/api/auth/callback/keycloak
   ```
   ⚠️ **Important:** Use `http://` not `https://` for local development

3. **Web Origins** - Must include:
   ```
   http://localhost:3000
   ```

4. **Access Type:**
   - If `KEYCLOAK_CLIENT_SECRET` is empty → Set to **Public**
   - If `KEYCLOAK_CLIENT_SECRET` has a value → Set to **Confidential**

5. **Standard Flow Enabled:** ✅ Yes

6. **Direct Access Grants Enabled:** ❌ No (for security)

### 4. Test Keycloak Connection

```bash
# Test if Keycloak is reachable
curl https://keycloak.afribrok.com/realms/afribrok/.well-known/openid-configuration

# Should return JSON with endpoints
```

### 5. Check the Error Page

After a failed sign-in attempt, you'll be redirected to `/auth/error` with the specific error code. Common errors:

- **Configuration**: Server config issue (check env vars)
- **AccessDenied**: User doesn't have permission
- **Verification**: Token expired or invalid
- **OAUTH_CALLBACK_ERROR**: Redirect URI mismatch (most common)

### 6. Common Fixes

#### Fix 1: Redirect URI Mismatch

**Symptom:** Error in logs shows `invalid_redirect_uri` or `OAUTH_CALLBACK_ERROR`

**Solution:**
1. In Keycloak, add exactly: `http://localhost:3000/api/auth/callback/keycloak`
2. Make sure there are no trailing slashes
3. Restart your dev server

#### Fix 2: NEXTAUTH_URL Mismatch

**Symptom:** Callbacks fail silently

**Solution:**
1. Set `NEXTAUTH_URL=http://localhost:3000` in `.env.local`
2. Restart dev server
3. Clear browser cache/cookies

#### Fix 3: CORS Issues

**Symptom:** Network errors in browser console

**Solution:**
1. Verify Keycloak "Web Origins" includes `http://localhost:3000`
2. Check browser console for CORS errors
3. Try in incognito mode

#### Fix 4: Client Secret Mismatch

**Symptom:** `invalid_client` error

**Solution:**
1. If using confidential client, ensure `KEYCLOAK_CLIENT_SECRET` matches Keycloak
2. If using public client, ensure `KEYCLOAK_CLIENT_SECRET` is empty and client is set to "Public"

### 7. Enable Debug Mode

Add to `.env.local`:
```bash
AUTH_DEBUG=true
NODE_ENV=development
```

This will show detailed logs in the terminal.

### 8. Test the Flow

1. Start dev server: `pnpm dev`
2. Open browser: `http://localhost:3000`
3. Click "Sign In with Keycloak"
4. Watch terminal for detailed logs
5. Check browser network tab for failed requests
6. If error occurs, check `/auth/error` page for details

## Quick Checklist

- [ ] `.env.local` exists with correct `NEXTAUTH_URL`
- [ ] Keycloak client has correct redirect URI
- [ ] Keycloak client has correct web origin
- [ ] Keycloak client access type matches secret config
- [ ] Dev server restarted after env changes
- [ ] Browser cache cleared
- [ ] Checked server logs for detailed errors
- [ ] Tested Keycloak connection with curl

## Still Having Issues?

1. **Check the error page** at `/auth/error?error=<error_code>` for specific guidance
2. **Enable debug mode** and review detailed logs
3. **Verify Keycloak is accessible** from your machine
4. **Check browser console** for additional errors
5. **Try incognito mode** to rule out cookie/cache issues

