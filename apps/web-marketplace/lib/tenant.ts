/**
 * Tenant management utility
 * Handles tenant persistence in cookies and localStorage
 */

const TENANT_COOKIE_KEY = 'afribrok-tenant';
const TENANT_STORAGE_KEY = 'afribrok-tenant';

export interface TenantInfo {
  slug: string;
  name: string;
  country: string;
  flag: string;
}

export const DEFAULT_TENANT: TenantInfo = {
  slug: 'et-addis',
  name: 'Ethiopia — Addis Ababa',
  country: 'Ethiopia',
  flag: '🇪🇹',
};

/**
 * Get current tenant from cookie, localStorage, or env variable
 */
export function getTenant(): string {
  // On server side, use env variable or default
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_TENANT_KEY || DEFAULT_TENANT.slug;
  }
  
  // Try cookie first (for SSR compatibility)
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  if (cookies[TENANT_COOKIE_KEY]) {
    return cookies[TENANT_COOKIE_KEY];
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(TENANT_STORAGE_KEY);
  if (stored) {
    return stored;
  }
  
  // Fallback to env variable (for client-side)
  if (process.env.NEXT_PUBLIC_TENANT_KEY) {
    return process.env.NEXT_PUBLIC_TENANT_KEY;
  }
  
  return DEFAULT_TENANT.slug;
}

/**
 * Set tenant in both cookie and localStorage
 */
export function setTenant(tenantSlug: string, days: number = 365): void {
  if (typeof window === 'undefined') return;
  
  // Set cookie
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${TENANT_COOKIE_KEY}=${tenantSlug};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  
  // Set localStorage
  localStorage.setItem(TENANT_STORAGE_KEY, tenantSlug);
}

/**
 * Get tenant info (currently only supports et-addis)
 */
export function getTenantInfo(slug: string = getTenant()): TenantInfo {
  // For now, only support et-addis
  // In the future, this can be expanded to fetch from API
  if (slug === 'et-addis' || !slug) {
    return DEFAULT_TENANT;
  }
  
  return DEFAULT_TENANT;
}

