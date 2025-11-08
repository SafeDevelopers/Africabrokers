import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public pages (no auth)
const PUBLIC_PREFIXES = [
  "/",
  "/sell",
  "/listings",        // includes /listings and /listings/*
  "/verify",          // includes /verify and /verify/*
  "/agents",          // includes /agents and /agents/*
  "/about",
  "/contact",
  "/broker/signin",
  "/broker/apply",
  "/broker/pending",
  "/auth/callback",   // NextAuth callback
];

// Broker-only routes (require authentication)
// These are routes under /broker/* that require authentication (excluding public ones)
const BROKER_PUBLIC_ROUTES = [
  "/broker/signin",
  "/broker/apply",
  "/broker/pending",
];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));
}

function isBrokerOnly(pathname: string) {
  // Check if it's a broker route
  if (!pathname.startsWith("/broker/")) {
    return false;
  }
  
  // Exclude public broker routes
  if (BROKER_PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return false;
  }
  
  // All other /broker/* routes require authentication
  return true;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // Set/ensure tenant cookie (default et-addis). Keep it simple.
  const res = NextResponse.next();
  const tenantCookie = req.cookies.get("afribrok-tenant")?.value;
  const tenant = tenantCookie || "et-addis";
  if (!tenantCookie) {
    res.cookies.set("afribrok-tenant", tenant, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // Redirect legacy /signin → /broker/signin
  if (pathname === "/signin") {
    url.pathname = "/broker/signin";
    return NextResponse.redirect(url);
  }

  // Public pages pass (per RBAC-MATRIX.md: PUBLIC routes accessible without auth)
  if (isPublic(pathname)) {
    res.headers.set("x-pathname", pathname);
    return res;
  }

  // Protect /dashboard and /broker root routes (per RBAC-MATRIX.md: BROKER routes require auth)
  // These routes redirect to /broker/dashboard but must require broker auth
  if (pathname === "/dashboard" || pathname === "/broker") {
    const brokerSessionCookie = req.cookies.get("ab_broker_session");
    if (!brokerSessionCookie) {
      url.pathname = "/broker/signin";
      return NextResponse.redirect(url);
    }
    // Redirect to broker dashboard if authenticated
    if (pathname === "/dashboard") {
      url.pathname = "/broker/dashboard";
      return NextResponse.redirect(url);
    }
    if (pathname === "/broker") {
      url.pathname = "/broker/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Broker-only routes: require a valid broker session cookie (HTTP-only)
  // Only honor ab_broker_session cookie - no query param auth
  // Deny public access (per RBAC-MATRIX.md: BROKER routes deny public)
  if (isBrokerOnly(pathname)) {
    const brokerSessionCookie = req.cookies.get("ab_broker_session");
    
    if (!brokerSessionCookie) {
      url.pathname = "/broker/signin";
      return NextResponse.redirect(url);
    }

    // For now, if cookie exists, allow access
    // In NextAuth migration, this will use getToken() to validate the session
    // For immediate hardening, we rely on backend to only set cookie when APPROVED
  }

  res.headers.set("x-pathname", pathname);
  return res;
}

// Exclude static, images, api, favicon, and files with extensions
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};