/**
 * Centralized API Client for web-admin
 * 
 * - Uses NEXT_PUBLIC_API_BASE_URL (throws error if missing in dev)
 * - Automatically adds Authorization (Bearer) and X-Tenant headers
 * - Standardizes response contract: { data: T, error?: {code, message} } or { items: T[], count?: number }
 * - Handles errors consistently
 * 
 * Works in both server and client contexts
 */

// Get BASE_URL - throw error if missing in development
const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
  
  if (!baseUrl) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('NEXT_PUBLIC_API_BASE_URL is missing. Please set it in your .env.local file.');
    }
    // In production, fallback to a default (shouldn't happen)
    console.error('NEXT_PUBLIC_API_BASE_URL is missing in production!');
    return 'http://localhost:4000';
  }
  
  return baseUrl;
};

const BASE_URL = getBaseUrl();

/**
 * Standard API response types
 */
export type ApiResponse<T> = 
  | { data: T; error?: never }
  | { data?: never; error: { code: string; message: string } };

export type ApiListResponse<T> = 
  | { items: T[]; count?: number; error?: never }
  | { items?: never; count?: never; error: { code: string; message: string } };

/**
 * Get user context from cookies (works on both client and server)
 */
async function getUserContext(): Promise<{ role: string | null; tenantId: string | null; token: string | null }> {
  // Server-side - dynamically import cookies to avoid issues
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return {
        role: cookieStore.get('afribrok-role')?.value || null,
        tenantId: cookieStore.get('afribrok-tenant-id')?.value || cookieStore.get('afribrok-tenant')?.value || null,
        token: cookieStore.get('afribrok-token')?.value || null,
      };
    } catch (error) {
      // If cookies() fails (e.g., in client component), fall back to null
      console.warn('Failed to read cookies on server:', error);
      return { role: null, tenantId: null, token: null };
    }
  }
  
  // Client-side
  const cookieObj: Record<string, string> = {};
  if (typeof document !== 'undefined') {
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookieObj[key] = decodeURIComponent(value);
      }
    });
  }
  
  return {
    role: cookieObj['afribrok-role'] || null,
    tenantId: cookieObj['afribrok-tenant-id'] || cookieObj['afribrok-tenant'] || null,
    token: cookieObj['afribrok-token'] || null,
  };
}

/**
 * Build request headers with Authorization and X-Tenant
 */
async function buildHeaders(): Promise<HeadersInit> {
  const { role, tenantId, token } = await getUserContext();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Always send X-Tenant header if tenantId exists
  // SUPER_ADMIN can override tenant via header, but we still send it
  if (tenantId) {
    headers['X-Tenant'] = tenantId;
    headers['x-tenant-id'] = tenantId;
  }
  
  return headers;
}

/**
 * Normalize endpoint - ensure it starts with /v1/
 */
function normalizeEndpoint(endpoint: string): string {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  if (endpoint.startsWith('/v1/')) {
    return endpoint;
  }
  return `/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

/**
 * Parse API error response
 */
async function parseError(response: Response): Promise<{ code: string; message: string }> {
  try {
    const body = await response.json();
    if (body.error) {
      return {
        code: body.error.code || `HTTP_${response.status}`,
        message: body.error.message || body.message || response.statusText,
      };
    }
    return {
      code: `HTTP_${response.status}`,
      message: body.message || response.statusText,
    };
  } catch {
    return {
      code: `HTTP_${response.status}`,
      message: response.statusText,
    };
  }
}

/**
 * Make API request with standardized error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${normalizeEndpoint(endpoint)}`;
  const headers = await buildHeaders();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
      cache: 'no-store',
    });
    
    // Handle non-2xx responses
    if (!response.ok) {
      const error = await parseError(response);
      throw new ApiError(error.message, error.code, response.status);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new ApiError(
        `Service unreachable: ${endpoint}`,
        'NETWORK_ERROR',
        0
      );
    }
    
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Wrap other errors
    if (error instanceof Error) {
      throw new ApiError(error.message, 'UNKNOWN_ERROR', 0);
    }
    
    throw new ApiError('Unknown error occurred', 'UNKNOWN_ERROR', 0);
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
  
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.status === 0;
  }
  
  isNotFound(): boolean {
    return this.status === 404;
  }
  
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

/**
 * API Client class
 */
class ApiClient {
  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  }
  
  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;

