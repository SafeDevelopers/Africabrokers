/**
 * API Client for Mobile Inspector App
 * Connects to AfriBrok Core API for broker verification
 */

import Constants from 'expo-constants';

// Get API base URL from environment or use default
const getApiBaseUrl = (): string => {
  // In Expo, use Constants.expoConfig.extra for environment variables
  // For CapRover deployment, this will be set via app.json extra config
  const apiUrl = Constants.expoConfig?.extra?.apiBaseUrl || 
                 process.env.EXPO_PUBLIC_API_BASE_URL ||
                 'http://localhost:4000';
  
  return apiUrl.replace(/\/$/, ''); // Remove trailing slash
};

const API_BASE_URL = getApiBaseUrl();

export interface VerifyQrResponse {
  valid: boolean;
  message?: string;
  broker?: {
    id: string;
    name?: string;
    licenseNumber: string;
    status: string;
    rating: number | null;
    approvedAt: string | null;
    strikeCount: number;
  };
  tenant?: {
    name: string;
    key: string;
    brandConfig: any;
  };
  verifiedAt?: string;
  qrCodeId: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

/**
 * Verify a broker QR code via API
 */
export async function verifyQrCodeViaApi(qrCodeId: string): Promise<{
  status: 'verified' | 'warning' | 'invalid';
  broker?: {
    id: string;
    name: string;
    license: string;
    approved: boolean;
    rating?: number;
    approvedAt?: string;
    strikeCount?: number;
  };
  message: string;
}> {
  try {
    const url = `${API_BASE_URL}/v1/verify/${encodeURIComponent(qrCodeId)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add tenant header if needed
        // 'x-tenant-id': tenantId,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          status: 'invalid',
          message: 'QR code not found. Please verify the code and try again.',
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        status: 'invalid',
        message: errorData.message || `Verification failed (${response.status})`,
      };
    }

    const data: VerifyQrResponse = await response.json();

    if (!data.valid || !data.broker) {
      return {
        status: 'warning',
        message: data.message || 'Broker verification failed.',
      };
    }

    // Map API response to app format
    const isApproved = data.broker.status === 'approved';

    return {
      status: isApproved ? 'verified' : 'warning',
      broker: {
        id: data.broker.id,
        name: data.broker.name || data.broker.licenseNumber,
        license: data.broker.licenseNumber,
        approved: isApproved,
        rating: data.broker.rating ?? undefined,
        approvedAt: data.broker.approvedAt ?? undefined,
        strikeCount: data.broker.strikeCount,
      },
      message: isApproved
        ? 'Broker is verified and active on AfriBrok.'
        : `Broker status: ${data.broker.status}. Not currently approved.`,
    };
  } catch (error) {
    // Network error or other exception
    const message = error instanceof Error ? error.message : 'Network error';
    
    return {
      status: 'invalid',
      message: `Unable to connect to verification service. ${message}`,
    };
  }
}

/**
 * Get broker details by ID
 */
export async function getBrokerById(brokerId: string): Promise<{
  success: boolean;
  broker?: any;
  error?: string;
}> {
  try {
    const url = `${API_BASE_URL}/v1/brokers/${encodeURIComponent(brokerId)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Failed to fetch broker (${response.status})`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      broker: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Check if we're in offline mode
 */
export function isOnline(): boolean {
  // In React Native, you might want to use NetInfo
  // For now, we'll assume online if we can make requests
  return true;
}

export { API_BASE_URL };

