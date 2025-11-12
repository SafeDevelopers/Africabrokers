# NextAuth/Keycloak Setup for CapRover

## Required Environment Variables

The following environment variables **must** be set in CapRover for NextAuth to work properly:

### Critical (Required)

1. **`NEXTAUTH_URL`** - The public URL of your web-admin app
   - Example: `https://admin.afribrok.com`
   - **This is critical** - without it, OAuth callbacks will fail
   - Must match the actual domain where the app is deployed

2. **`NEXTAUTH_SECRET`** - A random secret string for encrypting JWT tokens
   - Generate with: `openssl rand -base64 32`
   - Must be the same across all instances if using multiple servers
   - **Never commit this to git**

### Keycloak Configuration

3. **`KEYCLOAK_ISSUER`** - Full Keycloak realm issuer URL
   - Example: `https://keycloak.afribrok.com/realms/afribrok`
   - Must include `/realms/{realm-name}`

4. **`KEYCLOAK_CLIENT_ID`** - The Keycloak client ID
   - Example: `web-admin`
   - Must match the client ID configured in Keycloak

5. **`KEYCLOAK_CLIENT_SECRET`** (Optional) - Client secret if using confidential client
   - Leave empty for public clients (PKCE will be used automatically)
   - If using confidential client, set this value

## Keycloak Client Configuration

In Keycloak, ensure the client is configured with:

1. **Valid Redirect URIs** must include:
   ```
   https://admin.afribrok.com/api/auth/callback/keycloak
   ```
   (Replace with your actual domain)

2. **Web Origins** should include:
   ```
   https://admin.afribrok.com
   ```
   (Replace with your actual domain)

3. **Access Type**: 
   - Public (if not using client secret)
   - Confidential (if using client secret)

4. **Standard Flow Enabled**: Yes
5. **Direct Access Grants Enabled**: No (for security)

## Troubleshooting OAuth Callback Errors

If you see `OAUTH_CALLBACK_ERROR`:

1. **Check NEXTAUTH_URL**:
   ```bash
   # In CapRover, verify the environment variable is set correctly
   echo $NEXTAUTH_URL
   ```

2. **Verify Keycloak Redirect URI**:
   - Go to Keycloak Admin Console
   - Navigate to Clients → web-admin → Settings
   - Check "Valid Redirect URIs" includes: `{NEXTAUTH_URL}/api/auth/callback/keycloak`

3. **Check Network Connectivity**:
   - Ensure the web-admin container can reach Keycloak
   - Test: `curl https://keycloak.afribrok.com/realms/afribrok/.well-known/openid-configuration`

4. **Check Logs**:
   - Enable debug mode (set `NODE_ENV=development` temporarily)
   - Check CapRover logs for detailed error messages

## Example CapRover Environment Variables

```
NEXTAUTH_URL=https://admin.afribrok.com
NEXTAUTH_SECRET=your-generated-secret-here
KEYCLOAK_ISSUER=https://keycloak.afribrok.com/realms/afribrok
KEYCLOAK_CLIENT_ID=web-admin
KEYCLOAK_CLIENT_SECRET=
```

## Testing

After setting environment variables:

1. Restart the web-admin app in CapRover
2. Navigate to the sign-in page
3. Click "Sign In with Keycloak"
4. You should be redirected to Keycloak login
5. After successful login, you should be redirected back to the app

If redirect fails, check:
- NEXTAUTH_URL matches the actual domain
- Keycloak redirect URI is configured correctly
- Network connectivity between containers

