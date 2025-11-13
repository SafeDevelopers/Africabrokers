import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import TenantAdminSidebar from '../components/TenantAdminSidebar';

export default async function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get NextAuth token instead of cookies
  const headersList = await headers();
  let token;
  try {
    token = await getToken({ 
      req: {
        headers: Object.fromEntries(headersList.entries()),
      } as any,
      secret: process.env.NEXTAUTH_SECRET 
    });
  } catch (error) {
    console.error('[TenantAdminLayout] Error getting token:', error);
    redirect('/auth/signin');
  }

  if (!token) {
    // No session - redirect to sign in
    redirect('/auth/signin');
  }

  // Get roles from token
  const roles = (token.roles as string[]) || [];
  const isSuperAdmin = roles.includes('SUPER_ADMIN');
  const isTenantAdmin = roles.includes('TENANT_ADMIN');
  const isAgent = roles.includes('AGENT');

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[TenantAdminLayout] Token info:', {
      email: token.email,
      roles: roles,
      isSuperAdmin,
      isTenantAdmin,
      isAgent,
    });
  }

  // Super admin should use super layout
  if (isSuperAdmin) {
    redirect('/super');
  }

  // Redirect if not tenant admin or agent
  if (!isTenantAdmin && !isAgent) {
    console.warn('[TenantAdminLayout] Redirecting to signin: Not tenant admin or agent');
    redirect('/auth/signin');
  }

  // Note: Tenant context and cross-tenant access is enforced by API middleware
  // which validates X-Tenant header matches JWT tenantId

  return (
    <TenantAdminSidebar>
      {children}
    </TenantAdminSidebar>
  );
}

