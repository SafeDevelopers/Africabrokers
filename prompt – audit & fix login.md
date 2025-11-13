You are auditing a monorepo with two Next.js apps that use NextAuth + Keycloak:

- apps/web-admin  (admin portal for SUPER_ADMIN & TENANT_ADMIN)
- apps/web-marketplace  (public marketplace; BROKER may log in later, but marketplace browsing is public)

The Keycloak realm is `afribrok`, hosted at:
- Issuer: https://keycloak.afribrok.com/realms/afribrok

Keycloak clients:
- web-admin (public)
- web-marketplace (public)
- core-api (confidential, used by backend, not by NextAuth here)

Target behavior:

1) SUPER_ADMIN user:
   - Exists in Keycloak realm `afribrok`, with realm role SUPER_ADMIN.
   - Must be able to sign into web-admin (both locally at http://localhost:3000 and in prod at https://admin.afribrok.com) using Keycloak via NextAuth.
   - Once signed in, any route under /admin/** must be allowed only if the user has role SUPER_ADMIN or TENANT_ADMIN.

2) Tenant-admin / Agent onboarding:
   - Implemented backend-side, but from the frontend perspective:
     - SUPER_ADMIN approves an application in web-admin.
     - Backend will call Keycloak Admin API to:
       - create user,
       - assign TENANT_ADMIN role,
       - set required actions VERIFY_EMAIL + UPDATE_PASSWORD,
       - execute-actions-email so the user receives a password-setup email.
     - After the tenant admin sets their password via that email link, they must be able to log in via the same web-admin login page (NextAuth + Keycloak).

3) Broker onboarding:
   - Similar to tenant admin, but:
     - Approved by TENANT_ADMIN or SUPER_ADMIN,
     - Receives role BROKER,
     - After setting the password from the email link, broker can log into the broker login page (this can reuse the same Keycloak+NextAuth config; gating is done by roles and routes).

At this moment, when running apps/web-admin locally (http://localhost:3000), login fails with an OAuthCallbackError similar to:

  name: 'OAuthCallbackError',
  providerId: 'keycloak'
  ...
  [NextAuth] redirect callback { url: 'http://localhost:3000/', baseUrl: 'http://localhost:3000' }

Your tasks are:

---------------------------------------
1) Find and audit the NextAuth configuration
---------------------------------------

- Locate the NextAuth config files in:
  - apps/web-admin
  - apps/web-marketplace

- Ensure that for web-admin, the Keycloak provider is configured like this:

  - issuer: process.env.KEYCLOAK_ISSUER
    where KEYCLOAK_ISSUER MUST be:
      https://keycloak.afribrok.com/realms/afribrok

  - clientId: process.env.KEYCLOAK_CLIENT_ID
    where for web-admin: KEYCLOAK_CLIENT_ID MUST equal "web-admin"

  - clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || ""
    web-admin is a PUBLIC client in Keycloak, so clientSecret may be empty on the NextAuth side, BUT the Keycloak client for web-admin MUST be PUBLIC (not confidential). If the code expects a secret, keep the field but accept an empty string.

- Turn on debug + error logging in NextAuth for both apps:

  - Set `debug: true` in NextAuth options.
  - Add an `events.error` handler that logs the full error object, including `cause`, to the server console:

    events: {
      error(error) {
        console.error('[NextAuth] error event', error);
      },
    }

  This is to surface the real root cause instead of a generic OAuthCallbackError.

---------------------------------------
2) Fix env usage for local vs production
---------------------------------------

For apps/web-admin:

- In code, NextAuth MUST read:
  - process.env.NEXTAUTH_URL
  - process.env.NEXTAUTH_SECRET
  - process.env.KEYCLOAK_ISSUER
  - process.env.KEYCLOAK_CLIENT_ID

- DO NOT hardcode URLs; rely on env vars for:

  - Local dev:
    NEXTAUTH_URL=http://localhost:3000
    KEYCLOAK_ISSUER=https://keycloak.afribrok.com/realms/afribrok
    KEYCLOAK_CLIENT_ID=web-admin

  - Production:
    NEXTAUTH_URL=https://admin.afribrok.com
    KEYCLOAK_ISSUER=https://keycloak.afribrok.com/realms/afribrok
    KEYCLOAK_CLIENT_ID=web-admin

- If any of these envs are missing, throw a clear error at startup in development, so misconfigurations are obvious.

For apps/web-marketplace:

- Same pattern, but KEYCLOAK_CLIENT_ID MUST equal "web-marketplace" and NEXTAUTH_URL is:
  - http://localhost:3001 in dev
  - https://market.afribrok.com in prod

---------------------------------------
3) Check redirect URIs and callback paths
---------------------------------------

Assume the Keycloak clients are configured as:

- web-admin:
  - Valid Redirect URIs:
      https://admin.afribrok.com/api/auth/callback/keycloak
      http://localhost:3000/api/auth/callback/keycloak
  - Web Origins:
      https://admin.afribrok.com
      http://localhost:3000

- web-marketplace:
  - Valid Redirect URIs:
      https://market.afribrok.com/api/auth/callback/keycloak
      http://localhost:3001/api/auth/callback/keycloak
  - Web Origins:
      https://market.afribrok.com
      http://localhost:3001

Make sure the NextAuth route you are using for Keycloak callback EXACTLY matches `/api/auth/callback/keycloak`. Do not change Keycloak settings from code, but ensure our NextAuth config matches that path.

---------------------------------------
4) Decode roles into session & gate admin routes
---------------------------------------

For apps/web-admin:

- In the NextAuth JWT callback:
  - Persist `access_token` from the Keycloak account.
  - Decode the JWT payload (base64 decode the second part of the access_token).
  - Extract `realm_access.roles` array and assign it to `token.roles`.

- In the session callback:
  - Expose `roles` and `accessToken` on `session`.

- Add or fix middleware for `/admin/**`:

  - Only allow access if `roles` includes "SUPER_ADMIN" or "TENANT_ADMIN".
  - If not authorized, redirect to `/auth/forbidden` (or an appropriate forbidden page).

---------------------------------------
5) Leave marketplace public but wired to Keycloak (for later broker login)
---------------------------------------

For apps/web-marketplace:

- Verify that marketplace pages showing listings DO NOT require authentication.
  - API calls for listings SHOULD NOT include Authorization.
  - They should always include X-Tenant or allow backend default tenant.

- Still keep NextAuth + Keycloak wiring ready so that later a broker can sign in (with BROKER role), but do not enforce that for basic listing browsing.

---------------------------------------
6) Password reset & invite flows
---------------------------------------

For now, DO NOT implement the full backend Keycloak Admin API logic in this code (assume the API will handle that). Instead, ensure:

- Both apps have a "Forgot password" screen that POSTs to:
  - /v1/auth/password-reset
  - with JSON body: { email }
  - This endpoint on the backend is PUBLIC and will call Keycloak Admin API with execute-actions-email UPDATE_PASSWORD.

- Document (in comments) the expected flow:
  - SUPER_ADMIN or TENANT_ADMIN invites a tenant/broker via admin UI.
  - Backend uses a confidential Keycloak client (core-api) with client_credentials to:
    - create the Keycloak user,
    - assign realm role,
    - set required actions,
    - send execute-actions-email.

---------------------------------------
7) Fix the OAuthCallbackError for SUPER_ADMIN login in local dev
---------------------------------------

After auditing and making adjustments:

- Ensure that running apps/web-admin locally (http://localhost:3000) and hitting /api/auth/signin with provider "keycloak" allows a SUPER_ADMIN user (realm role SUPER_ADMIN in Keycloak) to log in without OAuthCallbackError.

- If errors remain, make sure the error event logging you added prints the FULL error (including cause) to the console, and adjust configuration so that:
  - issuer matches exactly the realm issuer,
  - clientId is correct,
  - NEXTAUTH_URL matches the origin,
  - callback path is /api/auth/callback/keycloak.

---------------------------------------
8) Output
---------------------------------------

At the end, list:

- What was wrong in the existing NextAuth/Keycloak configuration.
- The minimal code changes you made to fix SUPER_ADMIN login.
- Anything in the code the backend team MUST implement (for invites and password reset) but that you left as TODOs or comments.