# Keycloak Setup Guide for AfriBrok

This guide explains which clients to create in Keycloak and what permissions/settings to configure.

## 📋 Clients You Need to Create

You need to create **2 clients** in Keycloak:

1. **`core-api`** - Backend API authentication (Confidential Client)
2. **`mobile-inspector`** - Mobile app authentication (Public Client with PKCE)

---

## 🔧 Client 1: `core-api` (Backend API)

### Purpose
Used by your Core API backend to authenticate users from web-admin and web-marketplace.

### Configuration Steps

1. **Create Client:**
   - Go to Keycloak Admin Console → **Clients** → **Create client**
   - **Client ID**: `core-api`
   - **Client type**: `OpenID Connect`
   - Click **Next**

2. **Capability Config:**
   - ✅ **Client authentication**: `ON` (Confidential client - needs client secret)
   - ✅ **Authorization**: `OFF` (unless you need fine-grained permissions)
   - ✅ **Standard flow**: `ON` (Authorization Code Flow)
   - ✅ **Direct access grants**: `ON` (for email/password login)
   - ✅ **Implicit flow**: `OFF`
   - ✅ **OAuth 2.0 Device Authorization Grant**: `OFF`
   - Click **Next**

3. **Login Settings:**
   - **Root URL**: `https://api.afribrok.com` (your API domain)
   - **Home URL**: `https://api.afribrok.com`
   - **Valid redirect URIs**: 
     ```
     https://api.afribrok.com/v1/auth/callback
     https://admin.afribrok.com/api/auth/callback
     https://afribrok.com/api/auth/callback
     http://localhost:4000/v1/auth/callback
     http://localhost:3004/api/auth/callback
     http://localhost:3003/api/auth/callback
     ```
   - **Valid post logout redirect URIs**:
     ```
     https://admin.afribrok.com/login
     https://afribrok.com/broker/signin
     http://localhost:3004/login
     http://localhost:3003/broker/signin
     ```
   - **Web origins**: 
     ```
     https://admin.afribrok.com
     https://afribrok.com
     http://localhost:3004
     http://localhost:3003
     ```
   - Click **Save**

4. **Get Client Secret:**
   - After saving, go to **Credentials** tab
   - Copy the **Client secret** (you'll need this for `OIDC_CLIENT_SECRET`)

5. **Access Settings:**
   - **Access token lifespan**: `12 hours` (default is fine)
   - **SSO session idle**: `30 minutes`
   - **SSO session max**: `10 hours`

### Environment Variables for Core API

After creating this client, use these values:

```bash
OIDC_ISSUER_URL=https://auth.afribrok.com/realms/afribrok
# OR if using master realm:
# OIDC_ISSUER_URL=https://auth.afribrok.com/realms/master

OIDC_CLIENT_ID=core-api
OIDC_CLIENT_SECRET=<copy-from-keycloak-credentials-tab>
```

---

## 📱 Client 2: `mobile-inspector` (Mobile App)

### Purpose
Used by the mobile inspector app (React Native/Expo) for authentication.

### Configuration Steps

1. **Create Client:**
   - Go to Keycloak Admin Console → **Clients** → **Create client**
   - **Client ID**: `mobile-inspector`
   - **Client type**: `OpenID Connect`
   - Click **Next**

2. **Capability Config:**
   - ❌ **Client authentication**: `OFF` (Public client - no secret needed)
   - ❌ **Authorization**: `OFF`
   - ✅ **Standard flow**: `ON` (Authorization Code Flow)
   - ✅ **Direct access grants**: `ON` (optional - for testing)
   - ✅ **Implicit flow**: `OFF`
   - ✅ **OAuth 2.0 Device Authorization Grant**: `OFF`
   - Click **Next**

3. **Login Settings:**
   - **Root URL**: Leave empty (mobile app)
   - **Home URL**: Leave empty
   - **Valid redirect URIs**: 
     ```
     afribrokinspector://auth/callback
     exp://localhost:8081/--/auth/callback
     ```
   - **Valid post logout redirect URIs**: Leave empty
   - **Web origins**: Leave empty (mobile app)
   - Click **Save**

4. **Advanced Settings (PKCE Configuration):**
   - Go to **Advanced** tab (or **Settings** tab, depending on Keycloak version)
   - Look for **Proof Key for Code Exchange Code Challenge Method** or **PKCE Code Challenge Method**
   - Set to: `S256` (SHA-256)
   - **OR** look for **Proof Key for Code Exchange (PKCE)** toggle/checkbox
   - If you see a toggle, enable it and set method to `S256`
   - **Note:** In newer Keycloak versions (23+), PKCE might be enabled by default for public clients
   - **Access token lifespan**: `12 hours` (optional)
   
   **If you don't see PKCE settings:**
   - PKCE might be enabled by default for public clients in your Keycloak version
   - The mobile app code already uses PKCE (see `apps/mobile-inspector/src/lib/auth.ts`)
   - As long as the client is set as **Public** (Client authentication: OFF), PKCE should work
   - You can test it - if the mobile app authenticates successfully, PKCE is working

### Environment Variables for Mobile Inspector

After creating this client, update `apps/mobile-inspector/app.json`:

```json
{
  "extra": {
    "apiBaseUrl": "https://api.afribrok.com",
    "keycloakDiscoveryUrl": "https://auth.afribrok.com/realms/afribrok/.well-known/openid-configuration",
    "keycloakClientId": "mobile-inspector"
  }
}
```

---

## 👥 User Roles Setup

### Create Roles in Keycloak

1. Go to **Realm roles** (or **Client roles** if you prefer)
2. Create these roles:
   - `SUPER_ADMIN` - Super admin users
   - `TENANT_ADMIN` - Tenant admin users
   - `BROKER` - Broker users
   - `INSPECTOR` - Inspector users (for mobile app)
   - `AGENT` - Agent users

### Assign Roles to Users

1. Go to **Users** → Select a user
2. Go to **Role mapping** tab
3. Click **Assign role**
4. Select the appropriate role(s)
5. Click **Assign**

---

## 🔐 Realm Configuration

### Option 1: Use Master Realm (Simplest - Recommended for Start)

**You can use the default `master` realm** - no need to create a new one!

**Pros:**
- ✅ Already exists
- ✅ No setup needed
- ✅ Works immediately
- ✅ Good for testing/development

**Cons:**
- ⚠️ Less secure (shared with Keycloak admin)
- ⚠️ Not ideal for production (but works)

**If using `master` realm:**
- Your `OIDC_ISSUER_URL` will be: `https://auth.afribrok.com/realms/master`
- Or locally: `http://localhost:8080/realms/master`

### Option 2: Create a Dedicated Realm (Recommended for Production)

**Create a dedicated realm** for better security and organization:

1. Go to **Realm selector** (top left) → **Create realm**
2. **Realm name**: `afribrok`
3. Click **Create**

**If using `afribrok` realm:**
- Your `OIDC_ISSUER_URL` will be: `https://auth.afribrok.com/realms/afribrok`
- Or locally: `http://localhost:8080/realms/afribrok`

### Realm Settings (Optional - Defaults Work)

If you create a new realm, you can configure these (defaults work fine):

1. **General Settings:**
   - **Realm name**: `afribrok`
   - **Display name**: `AfriBrok`
   - **Enabled**: `ON` (default)

2. **Login Settings:**
   - **User registration**: `ON` (if you want users to self-register)
   - **Forgot password**: `ON` (default)
   - **Remember me**: `ON` (default)
   - **Email as username**: `ON` (recommended)

3. **Tokens:**
   - **Default signature algorithm**: `RS256` (default - good)
   - **Access token lifespan**: `12 hours` (default - fine)
   - **SSO session idle**: `30 minutes` (default - fine)
   - **SSO session max**: `10 hours` (default - fine)

---

## 📝 Summary Checklist

### Client 1: `core-api`
- [ ] Client ID: `core-api`
- [ ] Client authentication: `ON` (Confidential)
- [ ] Standard flow: `ON`
- [ ] Direct access grants: `ON`
- [ ] Valid redirect URIs configured
- [ ] Client secret copied
- [ ] Environment variables updated in Core API

### Client 2: `mobile-inspector`
- [ ] Client ID: `mobile-inspector`
- [ ] Client authentication: `OFF` (Public)
- [ ] Standard flow: `ON`
- [ ] PKCE settings checked (may be enabled by default in newer Keycloak versions)
- [ ] Valid redirect URIs configured (mobile deep links)
- [ ] App.json updated with client ID

### Realm Setup (Choose One)
- [ ] **Option A**: Using `master` realm (simplest - no setup needed)
  - [ ] Update `OIDC_ISSUER_URL` to use `/realms/master`
- [ ] **Option B**: Created new `afribrok` realm (recommended for production)
  - [ ] Update `OIDC_ISSUER_URL` to use `/realms/afribrok`

### Roles Setup (IMPORTANT - Do This!)
- [ ] Roles created: SUPER_ADMIN, TENANT_ADMIN, BROKER, INSPECTOR, AGENT
- [ ] Test users created and roles assigned

---

## 🧪 Testing

### Test Core API Client

1. **Get OIDC Configuration:**
   ```bash
   curl https://auth.afribrok.com/realms/afribrok/.well-known/openid-configuration
   ```

2. **Test Token Exchange:**
   ```bash
   curl -X POST https://auth.afribrok.com/realms/afribrok/protocol/openid-connect/token \
     -d "client_id=core-api" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "grant_type=client_credentials"
   ```

### Test Mobile Inspector Client

1. Open mobile app
2. Try to sign in
3. Should redirect to Keycloak login
4. After login, should redirect back to app

---

## 🔗 Keycloak URLs

### For Production:
- **Admin Console**: `https://auth.afribrok.com/admin`
- **Realm**: `https://auth.afribrok.com/realms/afribrok`
- **OIDC Discovery**: `https://auth.afribrok.com/realms/afribrok/.well-known/openid-configuration`

### For Local Development:
- **Admin Console**: `http://localhost:8080/admin`
- **Realm**: `http://localhost:8080/realms/afribrok` (or `/realms/master`)
- **OIDC Discovery**: `http://localhost:8080/realms/afribrok/.well-known/openid-configuration`

---

## ⚠️ Important Notes

1. **Client Secret Security:**
   - Never commit client secrets to Git
   - Store in environment variables only
   - Rotate secrets regularly

2. **Redirect URIs:**
   - Must match exactly (including http vs https)
   - Include both production and local development URLs
   - Mobile deep links must be exact

3. **PKCE for Mobile:**
   - Required for public clients (mobile apps)
   - Provides additional security
   - Must be enabled for `mobile-inspector` client

4. **Realm vs Master:**
   - Using a dedicated realm (`afribrok`) is recommended
   - Keeps your app separate from Keycloak's master realm
   - Easier to manage and more secure

---

## 🆘 Troubleshooting

### "Invalid redirect URI"
- Check that redirect URI matches exactly
- Check http vs https
- Check trailing slashes

### "Invalid client credentials"
- Verify client secret is correct
- Check client authentication is ON for confidential clients
- Verify client ID matches exactly

### "PKCE code challenge mismatch"
- Ensure PKCE is enabled in Keycloak client settings
- Verify mobile app is using S256 method
- Check code verifier/challenge generation

---

## 📚 Next Steps

After setting up Keycloak:

1. ✅ Create both clients (`core-api` and `mobile-inspector`)
2. ✅ Copy client secret for `core-api`
3. ✅ Update Core API environment variables
4. ✅ Update mobile inspector app.json
5. ✅ Create test users and assign roles
6. ✅ Test authentication flow

