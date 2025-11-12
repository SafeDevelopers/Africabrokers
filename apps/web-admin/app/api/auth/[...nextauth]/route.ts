import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

/**
 * NextAuth configuration for web-admin (App Router)
 * Uses Keycloak OIDC provider with PKCE (automatic)
 * Public client: no client secret required
 */

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is required but not set");
}

if (!process.env.NEXTAUTH_URL) {
  console.warn("⚠️  NEXTAUTH_URL is not set. This may cause OAuth callback errors.");
  console.warn("   Set NEXTAUTH_URL to your app's public URL (e.g., https://admin.afribrok.com)");
}

export const { GET, POST } = NextAuth({
  // @ts-expect-error - trustHost is valid in NextAuth v4.21+ but not in TypeScript types yet
  trustHost: true,
  providers: [
    KeycloakProvider({
      issuer: process.env.KEYCLOAK_ISSUER || "https://keycloak.afribrok.com/realms/afribrok",
      clientId: process.env.KEYCLOAK_CLIENT_ID || "web-admin",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Log sign-in attempts for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("[NextAuth] Sign-in attempt:", { 
          userId: user?.id, 
          email: user?.email,
          provider: account?.provider 
        });
      }
      return true;
    },
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
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

