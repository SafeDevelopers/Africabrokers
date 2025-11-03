/**
 * Feature flags for role-based UI rendering
 * Only render SUPER_ADMIN features if user has SUPER_ADMIN role
 */

export function canAccessSuperAdminFeatures(role: string | null | undefined): boolean {
  return role === 'SUPER_ADMIN';
}

export function canAccessTenantAdminFeatures(role: string | null | undefined): boolean {
  return role === 'TENANT_ADMIN' || role === 'AGENT' || role === 'SUPER_ADMIN';
}

export function canAccessAgentFeatures(role: string | null | undefined): boolean {
  return role === 'AGENT' || role === 'TENANT_ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Server-side feature flag check
 */
export async function checkFeatureFlag(feature: 'superAdmin' | 'tenantAdmin' | 'agent'): Promise<boolean> {
  const { getUserContext } = await import('./auth');
  const context = await getUserContext();
  
  switch (feature) {
    case 'superAdmin':
      return context.isSuperAdmin;
    case 'tenantAdmin':
      return context.isTenantAdmin || context.isAgent || context.isSuperAdmin;
    case 'agent':
      return context.isAgent || context.isTenantAdmin || context.isSuperAdmin;
    default:
      return false;
  }
}

