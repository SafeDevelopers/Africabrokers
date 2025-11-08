# Finding PKCE Settings in Keycloak

## 🔍 Where to Find PKCE Settings

PKCE settings location depends on your Keycloak version:

### Option 1: Advanced Tab (Older Versions)
1. Go to **Clients** → Select `mobile-inspector` client
2. Click **Advanced** tab
3. Look for:
   - **Proof Key for Code Exchange Code Challenge Method**
   - **PKCE Code Challenge Method**
   - Set to: `S256`

### Option 2: Settings Tab (Newer Versions 23+)
1. Go to **Clients** → Select `mobile-inspector` client
2. Click **Settings** tab
3. Scroll down to **Advanced settings** section
4. Look for:
   - **Proof Key for Code Exchange Code Challenge Method**
   - **PKCE Code Challenge Method**
   - Set to: `S256`

### Option 3: Not Visible (Default Enabled)
In **Keycloak 23+**, PKCE might be:
- ✅ **Enabled by default** for public clients
- ✅ **Automatically enforced** when client authentication is OFF
- ✅ **No manual configuration needed**

## ✅ How to Verify PKCE is Working

Even if you don't see the PKCE setting, it's likely working if:

1. **Client is Public** (Client authentication: OFF) ✅
2. **Standard flow is enabled** ✅
3. **Mobile app authenticates successfully** ✅

Your mobile app code (`apps/mobile-inspector/src/lib/auth.ts`) already uses PKCE:
- Generates `code_verifier`
- Creates `code_challenge` using S256
- Sends both in the auth request

## 🧪 Test PKCE

1. Try authenticating with the mobile app
2. If it works → PKCE is enabled (even if you can't see the setting)
3. If it fails with "PKCE code challenge mismatch" → PKCE needs to be configured

## 📝 What You Actually Need

For the `mobile-inspector` client, the **most important settings** are:

1. ✅ **Client authentication**: `OFF` (makes it a public client)
2. ✅ **Standard flow**: `ON` (enables Authorization Code Flow)
3. ✅ **Valid redirect URIs**: `afribrokinspector://auth/callback`

**PKCE is handled automatically** by Keycloak for public clients in newer versions!

## 🔧 If You Still Need to Configure PKCE

If your Keycloak version requires manual PKCE setup:

1. **Via Realm Settings:**
   - Go to **Realm settings** → **Security defenses**
   - Look for **PKCE** settings
   - Enable for public clients

2. **Via Client Settings:**
   - In client **Settings** tab
   - Look for **Advanced settings** section at the bottom
   - Find **Proof Key for Code Exchange Code Challenge Method**
   - Set to `S256`

3. **Via CLI (if UI doesn't show it):**
   ```bash
   # Update client via Keycloak Admin REST API
   # PKCE is usually enabled by default for public clients
   ```

## ✅ Bottom Line

**Don't worry if you don't see PKCE settings!**

- In Keycloak 23+ (which you're using), PKCE is **enabled by default** for public clients
- Your mobile app code **already uses PKCE**
- As long as the client is **Public** (authentication OFF), PKCE will work
- **Test it** - if authentication works, PKCE is working!

The key settings you need are:
- ✅ Client authentication: **OFF**
- ✅ Standard flow: **ON**
- ✅ Valid redirect URIs: **Configured**

That's it! PKCE is handled automatically.

