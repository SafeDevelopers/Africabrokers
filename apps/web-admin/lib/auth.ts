import { cookies } from 'next/headers';

/**
 * Get user context from server-side cookies
 */
export async function getUserContext() {
  const cookieStore = await cookies();
  
  const role = cookieStore.get('afribrok-role')?.value || null;
  const tenantId = cookieStore.get('afribrok-tenant')?.value || 
                  cookieStore.get('afribrok-tenant-id')?.value || 
                  null;
  const userId = cookieStore.get('afribrok-user-id')?.value || null;

  return {
    role,
    tenantId,
    userId,
    isSuperAdmin: role === 'SUPER_ADMIN',
    isTenantAdmin: role === 'TENANT_ADMIN',
    isAgent: role === 'AGENT',
  };
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

