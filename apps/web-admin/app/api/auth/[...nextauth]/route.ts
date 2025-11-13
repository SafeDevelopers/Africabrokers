import NextAuth, { type NextAuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

// Skip validation during Docker builds
const skipValidation = process.env.SKIP_ENV_VALIDATION === "true" || process.env.DOCKER_BUILD === "true";
const isDevelopment = process.env.NODE_ENV === "development" && !skipValidation;

// Prefer AUTH_* on NextAuth v5 but keep NEXTAUTH_* for compatibility
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!authSecret && !skipValidation) {
  const error = "AUTH_SECRET/NEXTAUTH_SECRET is required for NextAuth";
  if (isDevelopment) {
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  console.warn(`⚠️  ${error}`);
}

// Validate required environment variables (skip during Docker builds)
const nextAuthUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
if (!nextAuthUrl && !skipValidation) {
  const error = "NEXTAUTH_URL is required. Set to http://localhost:3000 (dev) or https://admin.afribrok.com (prod)";
  if (isDevelopment) {
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  console.warn(`⚠️  ${error}`);
}

const issuer = process.env.KEYCLOAK_ISSUER;
if (!issuer && !skipValidation) {
  const error = "KEYCLOAK_ISSUER is required. Set to https://keycloak.afribrok.com/realms/afribrok";
  if (isDevelopment) {
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  console.warn(`⚠️  ${error}`);
}

const clientId = process.env.KEYCLOAK_CLIENT_ID;
if (!clientId && !skipValidation) {
  const error = "KEYCLOAK_CLIENT_ID is required. For web-admin, set to 'web-admin'";
  if (isDevelopment) {
    console.error(`❌ ${error}`);
    throw new Error(error);
  }
  console.warn(`⚠️  ${error}`);
}

// Use validated values with fallbacks (required for Docker builds)
const validatedIssuer = issuer || "https://keycloak.afribrok.com/realms/afribrok";
const validatedClientId = clientId || "web-admin";
const validatedSecret = authSecret || "docker-build-placeholder-secret"; // Will be replaced at runtime
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? ""; // public client ok

const authOptions: NextAuthOptions = {
  // Enable debug in development to surface OAuth errors
  debug: process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG === "true" || process.env.NEXTAUTH_DEBUG === "true",

  secret: validatedSecret as string,

  providers: [
    Keycloak({
      issuer: validatedIssuer,
      clientId: validatedClientId,
      clientSecret: clientSecret || undefined, // Use undefined instead of empty string for public client
      // ensure standard scopes; PKCE & state are handled automatically in v5
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

  // Centralized error visibility
  logger: {
    error(code, metadata) {
      console.error("[NextAuth][error]", code);
      console.error("[NextAuth][error] Full metadata:", JSON.stringify(metadata, null, 2));
      
      // Log common OAuth errors with more detail
      if (code === "OAUTH_CALLBACK_ERROR" || code === "OAUTH_CALLBACK_HANDLER_ERROR" || code === "OAuthCallbackError") {
        console.error("[NextAuth] OAuth Callback Error Details:", {
          code,
          error: metadata?.error,
          errorDescription: metadata?.errorDescription,
          provider: metadata?.provider,
          providerId: (metadata as any)?.providerId,
          url: metadata?.url,
          message: metadata?.message,
          stack: metadata?.stack,
          cause: metadata?.cause,
          // Log the entire metadata object to see what's actually there
          fullMetadata: metadata,
        });
        
        // If metadata is an Error object, log its properties
        if (metadata instanceof Error) {
          console.error("[NextAuth] Error object details:", {
            name: metadata.name,
            message: metadata.message,
            stack: metadata.stack,
            cause: (metadata as any).cause,
          });
        }
        
        // Check if metadata has providerId but no other details
        if ((metadata as any)?.providerId === 'keycloak' && !metadata?.error) {
          console.error("[NextAuth] Keycloak OAuth callback failed but no error details available.");
          console.error("[NextAuth] This usually means:");
          console.error("  1. Check NEXTAUTH_URL is set correctly");
          console.error("  2. Check Keycloak redirect URI matches exactly");
          console.error("  3. Check Keycloak client configuration");
          console.error("  4. Check network connectivity to Keycloak");
        }
      }
    },
    warn(code) {
      console.warn("[NextAuth][warn]", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[NextAuth][debug]", code, JSON.stringify(metadata, null, 2));
      }
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // Show detailed error messages
  },

  session: { strategy: "jwt" },

  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        if (process.env.NODE_ENV !== "production") {
          console.log("[NextAuth] redirect callback", { url, baseUrl });
        }
        
        // If url is a relative path, make it absolute
        if (url.startsWith("/")) {
          const redirectUrl = `${baseUrl}${url}`;
          if (process.env.NODE_ENV !== "production") {
            console.log("[NextAuth] redirect callback - relative path:", redirectUrl);
          }
          return redirectUrl;
        }
        
        // If url is on the same origin, allow it
        try {
          const urlObj = new URL(url);
          if (urlObj.origin === baseUrl) {
            if (process.env.NODE_ENV !== "production") {
              console.log("[NextAuth] redirect callback - same origin:", url);
            }
            return url;
          }
        } catch (urlError) {
          console.warn("[NextAuth] redirect callback - invalid URL:", url, urlError);
        }
        
        // Default to home page
        if (process.env.NODE_ENV !== "production") {
          console.log("[NextAuth] redirect callback - defaulting to baseUrl:", baseUrl);
        }
        return baseUrl;
      } catch (error) {
        console.error("[NextAuth] redirect callback error:", error);
        // Return baseUrl as fallback
        return baseUrl;
      }
    },

    async signIn({ user, account, profile }) {
      try {
        if (process.env.NODE_ENV !== "production") {
          console.log("[NextAuth] signIn callback", { 
            email: user?.email, 
            provider: account?.provider,
            hasAccount: !!account,
            hasProfile: !!profile,
            accountType: account?.type,
            accountProvider: account?.provider,
          });
        }
        return true;
      } catch (error) {
        console.error("[NextAuth] signIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      try {
        // On first login, account is available
        if (account?.access_token) {
          (token as any).accessToken = account.access_token;
          
          // Decode roles from access token - wrap in try-catch to prevent breaking the flow
          try {
            const accessToken = account.access_token;
            if (typeof accessToken === 'string' && accessToken.length > 0) {
              const parts = accessToken.split(".");
              if (parts.length === 3) {
                try {
                  // Decode base64 - handle padding issues
                  let base64Payload = parts[1];
                  // Add padding if needed
                  while (base64Payload.length % 4) {
                    base64Payload += '=';
                  }
                  
                  const payloadJson = Buffer.from(base64Payload, "base64").toString("utf8");
                  const payload = JSON.parse(payloadJson);
                  
                  // Extract roles from realm_access.roles (as per requirements)
                  const roles = payload?.realm_access?.roles || [];
                  
                  (token as any).roles = Array.isArray(roles) ? roles : [];
                  
                  if (process.env.NODE_ENV !== "production") {
                    console.log("[NextAuth] jwt callback - extracted roles:", (token as any).roles);
                    console.log("[NextAuth] jwt callback - token payload keys:", Object.keys(payload || {}));
                  }
                } catch (parseError) {
                  console.error("[NextAuth] jwt callback - failed to parse token payload:", parseError);
                  // Continue without roles - don't break the flow
                }
              } else {
                console.warn("[NextAuth] jwt callback - access token doesn't have 3 parts, has:", parts.length);
              }
            }
          } catch (decodeError) {
            console.error("[NextAuth] jwt callback - failed to decode access token:", decodeError);
            // Don't fail the callback, just log the error
          }
        }
        
        // If roles weren't extracted from token, try to get from profile
        if (!(token as any).roles || ((token as any).roles as any[]).length === 0) {
          if (profile) {
            try {
              const profileRoles = (profile as any).realm_access?.roles || 
                                  (profile as any).roles ||
                                  [];
              if (Array.isArray(profileRoles) && profileRoles.length > 0) {
                (token as any).roles = profileRoles;
                if (process.env.NODE_ENV !== "production") {
                  console.log("[NextAuth] jwt callback - extracted roles from profile:", profileRoles);
                }
              }
            } catch (e) {
              // Ignore profile extraction errors
              if (process.env.NODE_ENV !== "production") {
                console.warn("[NextAuth] jwt callback - profile extraction error:", e);
              }
            }
          }
        }
        
        // Ensure roles is always an array
        if (!(token as any).roles) {
          (token as any).roles = [];
        }
        
        return token;
      } catch (error) {
        console.error("[NextAuth] jwt callback - CRITICAL ERROR:", error);
        console.error("[NextAuth] jwt callback - error stack:", (error as Error)?.stack);
        // Return token even if there's an error to prevent callback failure
        // But ensure roles is set to empty array
        if (!(token as any).roles) {
          (token as any).roles = [];
        }
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if ((token as any).roles) {
          (session as any).roles = (token as any).roles;
        }
        if ((token as any).accessToken) {
          (session as any).accessToken = (token as any).accessToken;
        }
        
        if (process.env.NODE_ENV !== "production") {
          console.log("[NextAuth] session callback", {
            email: session.user?.email,
            hasRoles: !!(session as any).roles,
            roles: (session as any).roles
          });
        }
        
        return session;
      } catch (error) {
        console.error("[NextAuth] session callback error:", error);
        return session;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };