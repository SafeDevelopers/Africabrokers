import { redirect } from 'next/navigation';
import { getUserContext } from '../../lib/auth';
import TenantAdminSidebar from '../components/TenantAdminSidebar';

export default async function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userContext;
  try {
    userContext = await getUserContext();
  } catch (error) {
    // If there's an error reading cookies, log it but don't redirect immediately
    // The middleware should handle auth checks
    console.error('[TenantAdminLayout] Error getting user context:', error);
    // Return a minimal layout that shows an error instead of redirecting
    // This prevents infinite redirect loops
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">Unable to verify authentication. Please try logging in again.</p>
          <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[TenantAdminLayout] User context:', {
      role: userContext.role,
      tenantId: userContext.tenantId,
      userId: userContext.userId,
      isTenantAdmin: userContext.isTenantAdmin,
      isAgent: userContext.isAgent,
      isSuperAdmin: userContext.isSuperAdmin,
    });
  }

  // Redirect if not tenant admin or agent
  if (!userContext.isTenantAdmin && !userContext.isAgent && !userContext.isSuperAdmin) {
    console.warn('[TenantAdminLayout] Redirecting to login: Not tenant admin or agent');
    redirect('/login');
  }

  // Super admin should use super layout
  if (userContext.isSuperAdmin) {
    redirect('/super');
  }

  // Ensure tenant context exists for tenant admin and agent
  // Forbid cross-tenant access: tenant must be set and match user's assigned tenant
  if ((userContext.isTenantAdmin || userContext.isAgent) && !userContext.tenantId) {
    console.warn('[TenantAdminLayout] Redirecting to login: Missing tenantId', {
      role: userContext.role,
      tenantId: userContext.tenantId,
    });
    redirect('/login');
  }
  
  // Note: Cross-tenant access is enforced by API middleware (tenant-context.middleware.ts)
  // which validates X-Tenant header matches JWT tenantId

  return (
    <TenantAdminSidebar>
      {children}
    </TenantAdminSidebar>
  );
}

