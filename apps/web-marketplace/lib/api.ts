/**
 * API client for broker pages
 * Automatically adds X-Tenant header from cookie
 */

import { getTenant } from './tenant';

const API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || 'http://localhost:8080';

export interface ApiOptions extends RequestInit {
  skipTenantHeader?: boolean;
}

/**
 * Make an API request with automatic X-Tenant header
 */
export async function api<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipTenantHeader, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add X-Tenant header unless explicitly skipped
  if (!skipTenantHeader) {
    const tenant = getTenant();
    (headers as Record<string, string>)['X-Tenant'] = tenant;
  }

  // Include credentials for cookie-based auth
  const credentials: RequestCredentials = 'include';

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as any;
}

