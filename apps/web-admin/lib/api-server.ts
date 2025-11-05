import { cookies } from 'next/headers';

/**
 * Get API headers for server-side requests
 * Includes Authorization and X-Tenant headers from cookies
 */
export async function getApiHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  
  const token = cookieStore.get('afribrok-token')?.value;
  const tenantId = cookieStore.get('afribrok-tenant')?.value || 
                   cookieStore.get('afribrok-tenant-id')?.value;
  const role = cookieStore.get('afribrok-role')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add X-Tenant header if tenantId exists and user is not SUPER_ADMIN
  if (tenantId && role !== 'SUPER_ADMIN') {
    headers['X-Tenant'] = tenantId;
    headers['x-tenant-id'] = tenantId;
  }

  return headers;
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_CORE_API_BASE_URL || 'http://localhost:4000';
}

/**
 * Make a server-side API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const headers = await getApiHeaders();

  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

