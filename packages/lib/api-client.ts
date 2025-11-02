/**
 * API Client for AfriBrok services
 * Provides typed interfaces for interacting with core-api
 */

export interface ApiConfig {
  baseUrl: string;
  tenantId?: string;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}/v1${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...(this.config.tenantId && { 'x-tenant-id': this.config.tenantId }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async authCallback(code: string, state?: string) {
    return this.request('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  async selectRole(role: string) {
    return this.request('/auth/select-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  // Broker endpoints  
  async createBroker(data: { licenseNumber: string; businessName?: string }) {
    return this.request('/brokers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBroker(id: string) {
    return this.request(`/brokers/${id}`);
  }

  async submitBroker(id: string, documentUrls: any) {
    return this.request(`/brokers/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ documentUrls }),
    });
  }

  // Review endpoints
  async getPendingReviews(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    
    return this.request(`/reviews/pending?${params.toString()}`);
  }

  async makeReviewDecision(reviewId: string, decision: string, notes?: string) {
    return this.request(`/reviews/${reviewId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  }

  // Listings endpoints
  async searchListings(params: any = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });
    
    return this.request(`/listings/search?${searchParams.toString()}`);
  }

  async getListing(id: string) {
    return this.request(`/listings/${id}`);
  }

  async createListing(data: any) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // QR Verification
  async verifyQrCode(qrCode: string) {
    return this.request(`/verify/${qrCode}`);
  }
}