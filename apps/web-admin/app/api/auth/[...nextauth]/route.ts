import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

/**
 * NextAuth configuration for web-admin
 * Uses Keycloak OIDC provider with PKCE (automatic)
 * Public client: no client secret required
 */
export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "web-admin",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "", // Optional for public clients (empty string if not provided)
      issuer: process.env.KEYCLOAK_ISSUER || "https://keycloak.afribrok.com/realms/afribrok",
      // PKCE is automatically enabled for Keycloak provider
    }),
  ],
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
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

