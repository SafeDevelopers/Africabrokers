import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to enforce route gating at the edge
 * Validates user role from cookies and redirects accordingly
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get role and tenant from cookies
  const role = request.cookies.get('afribrok-role')?.value;
  const tenantId = request.cookies.get('afribrok-tenant')?.value || 
                   request.cookies.get('afribrok-tenant-id')?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/auth', '/api/auth'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Super admin routes (/super/*)
  if (pathname.startsWith('/super')) {
    if (role !== 'SUPER_ADMIN') {
      // Redirect to tenant dashboard or login
      if (role && tenantId) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Tenant admin routes (default /)
  if (!pathname.startsWith('/super')) {
    // Check if user has valid role
    if (!role || !['TENANT_ADMIN', 'AGENT', 'SUPER_ADMIN'].includes(role)) {
      // Super admin trying to access tenant routes should be redirected
      if (role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/super', request.url));
      }
      // No valid role, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Ensure tenant context is set
    if (role !== 'SUPER_ADMIN' && !tenantId) {
      // Tenant admin/agent without tenant context - redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

