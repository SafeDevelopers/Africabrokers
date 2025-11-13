import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

// Prefer AUTH_* on NextAuth v5 but keep NEXTAUTH_* for compatibility
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  console.error("❌ AUTH_SECRET/NEXTAUTH_SECRET is required.");
}
if (!process.env.AUTH_URL && !process.env.NEXTAUTH_URL) {
  console.warn("⚠️  AUTH_URL/NEXTAUTH_URL not set. Set to https://admin.afribrok.com");
}

const issuer = process.env.KEYCLOAK_ISSUER ?? "https://keycloak.afribrok.com/realms/afribrok";
const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "web-admin";
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? ""; // public client ok

export const { GET, POST } = NextAuth({
  // helpful during bring-up; disable later
  debug: process.env.AUTH_DEBUG === "true" || process.env.NEXTAUTH_DEBUG === "true",

  secret: authSecret,

  providers: [
    Keycloak({
      issuer,
      clientId,
      clientSecret,
      // ensure standard scopes; PKCE & state are handled automatically in v5
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],

  // Centralized error visibility
  logger: {
    error(code, metadata) {
      console.error("[NextAuth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[NextAuth][warn]", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[NextAuth][debug]", code, metadata);
      }
    },
  },

  // pages: {
  //   signIn: "/auth/signin",
  //   error: "/auth/signin",
  // },

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[NextAuth] signIn", { email: user?.email, provider: account?.provider });
      }
      return true;
    },

    async jwt({ token, account }) {
      // persist access token
      if (account?.access_token) token.accessToken = account.access_token;

      // decode roles on first login AND subsequent requests
      const raw = (token as any).accessToken ?? account?.access_token;
      if (raw && !(token as any).roles) {
        try {
          const payloadJson = Buffer.from(raw.split(".")[1], "base64").toString("utf8");
          const payload = JSON.parse(payloadJson);
          (token as any).roles = payload?.realm_access?.roles ?? [];
        } catch (e) {
          console.error("[NextAuth] failed to decode roles from access_token", e);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if ((token as any).roles) (session as any).roles = (token as any).roles;
      if ((token as any).accessToken) (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },
});