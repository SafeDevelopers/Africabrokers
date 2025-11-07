/**
 * API Client for web-admin
 * Automatically sets X-Tenant header for non-super-admin requests
 * Works on both server-side and client-side
 */

const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || 'http://localhost:4000';

interface ApiClientConfig {
  includeTenant?: boolean; // Whether to include X-Tenant header
  headers?: Record<string, string>;
  cookies?: string; // For server-side: pass cookies string
}

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = CORE_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get user role and tenant from cookies (works on both client and server)
   */
  private getUserContext(cookieString?: string): { role: string | null; tenantId: string | null } {
    let cookies: Record<string, string> = {};

    if (cookieString) {
      // Server-side: parse cookie string
      cookieString.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          cookies[key] = decodeURIComponent(value);
        }
      });
    } else if (typeof window !== 'undefined') {
      // Client-side: use document.cookie
      document.cookie.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          cookies[key] = decodeURIComponent(value);
        }
      });
    }

    const role = cookies['afribrok-role'] || null;
    const tenantId = cookies['afribrok-tenant'] || cookies['afribrok-tenant-id'] || null;

    return { role, tenantId };
  }

  /**
   * Build request headers
   */
  private buildHeaders(config?: ApiClientConfig): HeadersInit {
    const { role, tenantId } = this.getUserContext(config?.cookies);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config?.headers,
    };

    // Only set X-Tenant for non-super-admin requests
    if (config?.includeTenant !== false && tenantId && role !== 'SUPER_ADMIN') {
      headers['X-Tenant'] = tenantId;
      headers['x-tenant-id'] = tenantId;
    }

    // Include Authorization header if present in cookies
    const cookies = config?.cookies 
      ? this.getUserContext(config.cookies)
      : (typeof window !== 'undefined' ? this.getUserContext() : { role: null, tenantId: null });

    // For server-side, we need to parse cookies from the cookie string
    let cookieObj: Record<string, string> = {};
    if (config?.cookies) {
      config.cookies.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          cookieObj[key] = decodeURIComponent(value);
        }
      });
    } else if (typeof window !== 'undefined') {
      document.cookie.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          cookieObj[key] = decodeURIComponent(value);
        }
      });
    }

    const token = cookieObj['afribrok-token'] || cookieObj['token'];
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // For server-side requests, forward cookies
    if (config?.cookies) {
      headers['Cookie'] = config.cookies;
    }

    return headers;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(endpoint: string, config?: ApiClientConfig): Promise<T> {
    // Ensure endpoint starts with /v1 if it doesn't already
    const normalizedEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    
    // Debug logging in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[ApiClient] GET', url, { baseUrl: this.baseUrl, endpoint });
    }
    
    try {
      const headers = this.buildHeaders(config);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: config?.cookies ? 'omit' : 'include', // Omit credentials if using cookie header
        cache: 'no-store',
        ...(config?.cookies && { next: { revalidate: 0 } }), // Server-side cache control
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error(`Network error: Unable to connect to API at ${url}. Please check if the API is running at ${this.baseUrl}.`);
      }
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(endpoint: string, data?: any, config?: ApiClientConfig): Promise<T> {
    // Ensure endpoint starts with /v1 if it doesn't already
    const normalizedEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(endpoint: string, data?: any, config?: ApiClientConfig): Promise<T> {
    // Ensure endpoint starts with /v1 if it doesn't already
    const normalizedEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, config?: ApiClientConfig): Promise<T> {
    // Ensure endpoint starts with /v1 if it doesn't already
    const normalizedEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(endpoint: string, config?: ApiClientConfig): Promise<T> {
    // Ensure endpoint starts with /v1 if it doesn't already
    const normalizedEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(config),
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

