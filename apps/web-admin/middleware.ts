import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getUserRoles, hasRole } from "./lib/auth-helpers";

/**
 * Admin middleware:
 * - Only admin roles may proceed (SUPER_ADMIN, TENANT_ADMIN, AGENT)
 * - Uses NextAuth session with role gating
 * - If any broker cookies/roles are present, clear them and go to /login (NEVER redirect to marketplace)
 * - Public routes: /login, /api/auth (OIDC/NextAuth), static assets are excluded via matcher
 * - Hard separation: admin app never redirects to marketplace
 */

const ADMIN_ALLOWED_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "AGENT"];

// Broker-specific cookie names (only these are broker-exclusive)
const BROKER_SPECIFIC_COOKIES = [
  "ab_broker_session",       // NextAuth marketplace session (broker-only)
];

const ADMIN_ROLE_COOKIE = "afribrok-role";         // Admin role cookie (shared)
const ADMIN_TENANT_COOKIE = "afribrok-tenant-id";  // Admin tenant context cookie (shared)

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;

  // Allow admin login & auth callbacks without gating
  if (pathname.startsWith("/login") || pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Hard separation: If somehow the admin app got a /broker/* path, force to /login
  // NEVER redirect to marketplace - this is the admin app!
  if (pathname.startsWith("/broker")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check for broker-specific cookies (ab_broker_session) and clear them
  const brokerSessionCookie = request.cookies.get("ab_broker_session");
  if (brokerSessionCookie) {
    const resp = NextResponse.redirect(new URL("/login", request.url));
    BROKER_SPECIFIC_COOKIES.forEach((name) => {
      resp.cookies.set(name, "", { 
        maxAge: 0, 
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    });
    return resp;
  }

  // Use NextAuth session for role gating
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      // No session - redirect to login
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Get roles from token
    const userRoles = (token.roles as string[]) || [];
    
    // Check if user has required admin role
    if (!hasRole(userRoles, ADMIN_ALLOWED_ROLES)) {
      // Not authorized - redirect to forbidden or login
      url.pathname = "/auth/forbidden";
      return NextResponse.redirect(url);
    }

    // All good - admin authenticated with valid role
    return NextResponse.next();
  } catch (error) {
    // Error getting token - redirect to login
    console.error("Middleware error:", error);
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

// Exclude static, images, api, favicon, and files with extensions
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};