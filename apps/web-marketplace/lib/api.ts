/**
 * Centralized API client for marketplace
 * Handles error checking, content-type validation, and error mapping
 */

import { getTenant } from './tenant';

// Import validation (runs at module load time in server context only)
// Skip during build if SKIP_ENV_VALIDATION is set
if (typeof window === 'undefined' && typeof require !== 'undefined' && process.env.SKIP_ENV_VALIDATION !== 'true') {
  try {
    require('./validate-env');
  } catch (e) {
    // Ignore if validation file doesn't exist (e.g., in client bundle)
  }
}

// Enforce baseURL from NEXT_PUBLIC_API_BASE_URL (required)
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not configured. Please set it in your .env.local file.');
}

export type NetworkError = {
  kind: 'NetworkError';
  status?: number;
  url: string;
  message: string;
};

export type BadContentTypeError = {
  kind: 'BadContentType';
  url: string;
  status: number;
  contentType: string;
};

export interface ApiOptions extends RequestInit {
  skipTenantHeader?: boolean;
}

/**
 * Make an API request with automatic error handling and content-type checking
 */
export async function api<T = any>(
  path: string,
  init: ApiOptions = {}
): Promise<T> {
  const { skipTenantHeader, ...fetchOptions } = init;
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  // Add X-Tenant header unless explicitly skipped
  if (!skipTenantHeader) {
    const tenant = getTenant();
    (headers as Record<string, string>)['X-Tenant'] = tenant;
  }

  const url = path.startsWith('http') ? path : new URL(path, baseURL).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw { kind: 'NetworkError', url, message } as NetworkError;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  // If response is not ok, handle error
  if (!response.ok) {
    let message = `HTTP ${response.status} ${response.statusText}`;
    try {
      if (isJson) {
        const j = await response.json();
        message = j?.error?.message || j?.message || message;
      } else {
        // Try to get text error message
        const text = await response.text().catch(() => '');
        if (text && text.length < 500) {
          // If it's a short HTML response, try to extract meaningful error
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            message = `Server returned HTML instead of JSON (status: ${response.status}). This usually means the endpoint doesn't exist or there's a server error.`;
          } else {
            message = text;
          }
        }
      }
    } catch {
      // If parsing fails, use default message
    }
    
    throw { 
      kind: 'NetworkError', 
      status: response.status, 
      url, 
      message 
    } as NetworkError;
  }

  // If response is ok but content-type is not JSON, throw typed error
  if (!isJson) {
    // Throw typed error: { kind:'BadContentType', url, status }
    throw { 
      kind: 'BadContentType', 
      url, 
      status: response.status,
      contentType
    } as BadContentTypeError;
  }

  try {
    return await response.json() as Promise<T>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse JSON response';
    throw { kind: 'NetworkError', url, message } as NetworkError;
  }
}

/**
 * Get user-friendly error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'kind' in error) {
    const networkError = error as NetworkError;
    if (networkError.kind === 'NetworkError') {
      return networkError.message || 'Network request failed';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

/**
 * Get error details for debugging (status, route, etc.)
 */
export function getErrorDetails(error: unknown): { status?: number; url?: string; message: string } {
  if (typeof error === 'object' && error !== null && 'kind' in error) {
    const networkError = error as NetworkError;
    if (networkError.kind === 'NetworkError') {
      return {
        status: networkError.status,
        url: networkError.url,
        message: networkError.message || 'Network request failed',
      };
    }
  }
  
  return {
    message: getErrorMessage(error),
  };
}
