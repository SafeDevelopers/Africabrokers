import { cookies } from 'next/headers';

/**
 * Get user context from server-side cookies
 */
export async function getUserContext() {
  try {
    const cookieStore = await cookies();
    
    const role = cookieStore.get('afribrok-role')?.value || null;
    const tenantId = cookieStore.get('afribrok-tenant-id')?.value || 
                    cookieStore.get('afribrok-tenant')?.value || 
                    null;
    const userId = cookieStore.get('afribrok-user-id')?.value || null;

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      const allCookies = {
        'afribrok-role': cookieStore.get('afribrok-role')?.value,
        'afribrok-tenant-id': cookieStore.get('afribrok-tenant-id')?.value,
        'afribrok-tenant': cookieStore.get('afribrok-tenant')?.value,
        'afribrok-user-id': cookieStore.get('afribrok-user-id')?.value,
        'afribrok-token': cookieStore.get('afribrok-token')?.value ? 'present' : 'missing',
      };
      console.log('[getUserContext] Cookies:', allCookies);
    }

    return {
      role,
      tenantId,
      userId,
      isSuperAdmin: role === 'SUPER_ADMIN',
      isTenantAdmin: role === 'TENANT_ADMIN',
      isAgent: role === 'AGENT',
    };
  } catch (error) {
    // If there's an error reading cookies, return empty context
    // This will be handled by the layout
    console.error('[getUserContext] Error reading cookies:', error);
    return {
      role: null,
      tenantId: null,
      userId: null,
      isSuperAdmin: false,
      isTenantAdmin: false,
      isAgent: false,
    };
  }
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRoles: string[]): Promise<boolean> {
  const { role } = await getUserContext();
  if (!role) return false;
  
  // SUPER_ADMIN has access to everything
  if (role === 'SUPER_ADMIN') return true;
  
  return requiredRoles.includes(role);
}

