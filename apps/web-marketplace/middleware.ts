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
  
  // Allow access to signin and callback routes
  if (pathname === '/signin' || pathname.startsWith('/auth/callback')) {
    return response;
  }
  
  // Role gate for broker routes - only BROKER role can access
  const brokerRoutes = [
    '/dashboard',
    '/billing',
    '/profile',
    '/analytics',
    '/settings',
    '/referral',
    '/qr',
    '/docs',
  ];
  
  // /listings/new is broker-only, but /listings (browse) is public
  // /inquiries is broker-only
  const isBrokerNewListing = pathname === '/listings/new';
  const isBrokerInquiries = pathname === '/inquiries' || pathname.startsWith('/inquiries/');
  const isBrokerRoute = brokerRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isBrokerLegacyRoute = pathname.startsWith('/broker/') && pathname !== '/broker/apply' && pathname !== '/broker/pending';
  
  if (isBrokerRoute || isBrokerNewListing || isBrokerInquiries || isBrokerLegacyRoute) {
    const role = request.cookies.get('afribrok-role')?.value;
    const roleParam = request.nextUrl.searchParams.get('role');
    const tokenParam = request.nextUrl.searchParams.get('token');
    
    // Allow access if:
    // 1. Cookie has BROKER role, OR
    // 2. URL params contain auth info from admin app (cross-origin auth)
    const hasBrokerCookie = role && ['BROKER', 'broker'].includes(role);
    const hasAuthParams = roleParam === 'BROKER' && tokenParam;
    
    // If no valid auth, redirect to signin page
    if (!hasBrokerCookie && !hasAuthParams) {
      return NextResponse.redirect(new URL('/signin', request.url));
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

