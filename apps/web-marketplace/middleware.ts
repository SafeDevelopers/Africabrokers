import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  // Get tenant from cookie, query param, or default to et-addis
  const tenantFromCookie = request.cookies.get('afribrok-tenant')?.value;
  const tenantFromQuery = request.nextUrl.searchParams.get('tenant');
  const tenant = tenantFromQuery || tenantFromCookie || 'et-addis';
  
  // If tenant comes from query param, set it in cookie
  if (tenantFromQuery && tenantFromQuery !== tenantFromCookie) {
    response.cookies.set('afribrok-tenant', tenantFromQuery, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  } else if (!tenantFromCookie) {
    // Set default tenant if no cookie exists
    response.cookies.set('afribrok-tenant', tenant, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  
  // Redirect old registration routes to appropriate pages
  if (pathname === '/register-seller' || pathname === '/register-individual' || pathname === '/register-realestate') {
    return NextResponse.redirect(new URL('/sell', request.url));
  }
  
  // Role gate for broker routes - only BROKER role can access
  if (pathname.startsWith('/broker/') && pathname !== '/broker/apply' && pathname !== '/broker/pending') {
    const role = request.cookies.get('afribrok-role')?.value;
    const roleParam = request.nextUrl.searchParams.get('role');
    const tokenParam = request.nextUrl.searchParams.get('token');
    
    // Allow access if:
    // 1. Cookie has BROKER role, OR
    // 2. URL params contain auth info from admin app (cross-origin auth)
    const hasBrokerCookie = role && ['BROKER', 'broker', 'real-estate'].includes(role);
    const hasAuthParams = roleParam === 'BROKER' && tokenParam;
    
    // If no valid auth, redirect to homepage instead of login page
    if (!hasBrokerCookie && !hasAuthParams) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Redirect /home to /
  if (pathname === '/home') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

