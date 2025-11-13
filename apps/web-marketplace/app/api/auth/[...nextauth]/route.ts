import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

/**
 * NextAuth configuration for web-marketplace
 * Uses Keycloak OIDC provider with PKCE (automatic)
 * Public client: no client secret required
 * 
 * NOTE: Marketplace pages are PUBLIC - authentication is optional for browsing listings.
 * Brokers can sign in later (with BROKER role), but listing browsing does not require auth.
 */

// Validate required environment variables
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (!nextAuthUrl) {
  const error = "NEXTAUTH_URL is required. Set to http://localhost:3001 (dev) or https://market.afribrok.com (prod)";
  if (process.env.NODE_ENV === "development") {
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  console.warn(`⚠️  ${error}`);
}

const issuer = process.env.KEYCLOAK_ISSUER;
if (!issuer) {
  const error = "KEYCLOAK_ISSUER is required. Set to https://keycloak.afribrok.com/realms/afribrok";
  if (process.env.NODE_ENV === "development") {
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  console.warn(`⚠️  ${error}`);
}

const clientId = process.env.KEYCLOAK_CLIENT_ID;
if (!clientId) {
  const error = "KEYCLOAK_CLIENT_ID is required. For web-marketplace, set to 'web-marketplace'";
  if (process.env.NODE_ENV === "development") {
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  console.warn(`⚠️  ${error}`);
}

const authSecret = process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  const error = "NEXTAUTH_SECRET is required";
  if (process.env.NODE_ENV === "development") {
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  console.warn(`⚠️  ${error}`);
}

// Use validated values with fallbacks only for production
const validatedIssuer = issuer || "https://keycloak.afribrok.com/realms/afribrok";
const validatedClientId = clientId || "web-marketplace";
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET; // Optional for public clients

export const authOptions: NextAuthOptions = {
  // Enable debug in development to surface OAuth errors
  debug: process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG === "true",

  secret: authSecret || "placeholder-secret-change-in-production",

  providers: [
    KeycloakProvider({
      clientId: validatedClientId,
      clientSecret: clientSecret || undefined, // Use undefined for public client
      issuer: validatedIssuer,
      // PKCE is automatically enabled for Keycloak provider
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],

  // Add events.error handler to catch OAuth callback errors with full details
  events: {
    error({ error }) {
      console.error("[NextAuth] error event - Full error object:", error);
      console.error("[NextAuth] error event - Error name:", error?.name);
      console.error("[NextAuth] error event - Error message:", error?.message);
      console.error("[NextAuth] error event - Error stack:", error?.stack);
      if ((error as any)?.cause) {
        console.error("[NextAuth] error event - Error cause:", (error as any).cause);
      }
      // Log the entire error object to see all properties
      console.error("[NextAuth] error event - Full error JSON:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    },
  },
  callbacks: {
    async jwt({ token, account }) {
      // Store access_token on JWT for API calls
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      
      // Decode realm_access.roles from access_token
      if (account?.access_token) {
        try {
          // Decode JWT without verification (we trust Keycloak)
          const base64Url = account.access_token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
              .toString()
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          
          // Extract roles from realm_access
          if (payload.realm_access?.roles) {
            token.roles = payload.realm_access.roles as string[];
          }
        } catch (error) {
          console.error("Failed to decode access_token:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Expose roles on session
      if (token.roles) {
        (session as any).roles = token.roles;
      }
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/broker/signin",
    error: "/broker/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

