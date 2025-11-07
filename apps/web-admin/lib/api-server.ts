import { cookies } from 'next/headers';

/**
 * Get API headers for server-side requests
 * Includes Authorization and X-Tenant headers from cookies
 */
export async function getApiHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  
  const token = cookieStore.get('afribrok-token')?.value;
  const tenantId = cookieStore.get('afribrok-tenant-id')?.value || 
                   cookieStore.get('afribrok-tenant')?.value;
  const role = cookieStore.get('afribrok-role')?.value;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[getApiHeaders] Cookies:', {
      hasToken: !!token,
      tenantId,
      role,
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add X-Tenant header if tenantId exists and user is not SUPER_ADMIN
  // The API expects x-tenant-id header for tenant context
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
  
  try {
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
      // For 401/403 errors, log but don't throw - let the page handle it gracefully
      if (response.status === 401 || response.status === 403) {
        console.warn(`API auth error (${response.status}): ${endpoint}`, errorText);
        // Create a specific error that pages can catch and handle
        const authError = new Error(`Authentication failed: ${response.status}`);
        (authError as any).status = response.status;
        (authError as any).isAuthError = true;
        throw authError;
      }
      // For other errors, throw normally
      const error = new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unknown error during API request: ${endpoint}`);
  }
}

