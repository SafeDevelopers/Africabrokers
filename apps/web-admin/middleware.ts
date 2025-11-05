import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin middleware:
 * - Only admin roles may proceed (SUPER_ADMIN, TENANT_ADMIN, AGENT)
 * - If any broker cookies/roles are present, clear them and go to /login (NEVER redirect to marketplace)
 * - Public routes: /login, /api/auth (OIDC/NextAuth), static assets are excluded via matcher
 * - Hard separation: admin app never redirects to marketplace
 */

const ADMIN_ALLOWED_ROLES = new Set(["SUPER_ADMIN", "TENANT_ADMIN", "AGENT"]);

// Broker-specific cookie names (only these are broker-exclusive)
const BROKER_SPECIFIC_COOKIES = [
  "ab_broker_session",       // NextAuth marketplace session (broker-only)
];

const ADMIN_ROLE_COOKIE = "afribrok-role";         // Admin role cookie (shared)
const ADMIN_TENANT_COOKIE = "afribrok-tenant-id";  // Admin tenant context cookie (shared)

export function middleware(request: NextRequest) {
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

  // Allow root path - it will be handled by (tenant)/page.tsx or (tenant)/layout.tsx
  // The middleware will check auth below, so we continue to the auth checks

  // Check for broker-specific cookies (ab_broker_session) and clear them
  // Also check if afribrok-role is set to BROKER (broker role in shared cookie)
  const brokerSessionCookie = request.cookies.get("ab_broker_session");
  const roleCookie = request.cookies.get("afribrok-role");
  const isBrokerRole = roleCookie && (roleCookie.value === "BROKER" || roleCookie.value === "broker");

  if (brokerSessionCookie || isBrokerRole) {
    const resp = NextResponse.redirect(new URL("/login", request.url));
    // Clear broker-specific cookies
    BROKER_SPECIFIC_COOKIES.forEach((name) => {
      resp.cookies.set(name, "", { 
        maxAge: 0, 
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    });
    // If role is BROKER, clear it (but don't clear if it's admin role)
    if (isBrokerRole) {
      resp.cookies.set("afribrok-role", "", {
        maxAge: 0,
        path: "/",
      });
    }
    return resp;
  }

  // Read admin role + tenant from cookies (legacy/simple mode)
  // In NextAuth/Keycloak migration, switch to getToken() for robust role checks
  const role = request.cookies.get(ADMIN_ROLE_COOKIE)?.value;
  const tenantId = request.cookies.get(ADMIN_TENANT_COOKIE)?.value;

  // No role -> go to admin login (NEVER redirect to marketplace)
  if (!role) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role not allowed for admin -> back to admin login (NEVER send to marketplace)
  // Also check if role is BROKER (should have been caught above, but double-check)
  if (!ADMIN_ALLOWED_ROLES.has(role) || role === "BROKER" || role === "broker") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Tenant admins/agents should have tenant context; SUPER_ADMIN can pass without it
  if (role !== "SUPER_ADMIN" && !tenantId) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // All good - admin authenticated
  return NextResponse.next();
}

// Exclude static, images, api, favicon, and files with extensions
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};