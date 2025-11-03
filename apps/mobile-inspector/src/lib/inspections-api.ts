import Constants from 'expo-constants';
import { getCurrentUser } from './auth';
import { addToOfflineQueue, getPendingSyncItems, updateOfflineItem, removeFromOfflineQueue, OfflineInspection } from './offline-sync';

const getApiBaseUrl = (): string => {
  const apiUrl = Constants.expoConfig?.extra?.apiBaseUrl || 
                 process.env.EXPO_PUBLIC_API_BASE_URL ||
                 'http://localhost:4000';
  return apiUrl.replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

export interface CreateInspectionDto {
  qrCodeId: string;
  verificationResult: any;
  violationType?: string;
  violationNotes?: string;
  location?: { latitude: number; longitude: number };
  photos?: string[];
}

/**
 * Submit inspection (online or offline)
 */
export async function submitInspection(dto: CreateInspectionDto): Promise<{ success: boolean; id?: string; offline?: boolean }> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required. Please sign in to Inspector Mode.');
  }

  try {
    // Try to submit online first
    const response = await fetch(`${API_BASE_URL}/v1/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`,
        'x-user-id': user.id,
        'x-tenant-id': user.tenantId,
      },
      body: JSON.stringify(dto),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, id: data.id, offline: false };
    } else {
      // If API fails, add to offline queue
      throw new Error('API request failed');
    }
  } catch (error) {
    // Add to offline queue for later sync
    const offlineId = await addToOfflineQueue({
      qrCodeId: dto.qrCodeId,
      verificationResult: dto.verificationResult,
      violationType: dto.violationType,
      violationNotes: dto.violationNotes,
      location: dto.location,
      photos: dto.photos || [],
      status: "pending_sync",
    });

    return { success: true, id: offlineId, offline: true };
  }
}

/**
 * Sync pending inspections
 */
export async function syncPendingInspections(): Promise<{ synced: number; failed: number }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { synced: 0, failed: 0 };
  }

  const pendingItems = await getPendingSyncItems();
  let synced = 0;
  let failed = 0;

  for (const item of pendingItems) {
    try {
      // Mark as syncing
      await updateOfflineItem(item.id, { status: "syncing" });

      const response = await fetch(`${API_BASE_URL}/v1/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
          'x-user-id': user.id,
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify({
          qrCodeId: item.qrCodeId,
          verificationResult: item.verificationResult,
          violationType: item.violationType,
          violationNotes: item.violationNotes,
          location: item.location,
          photos: item.photos,
        }),
      });

      if (response.ok) {
        // Remove from queue
        await removeFromOfflineQueue(item.id);
        synced++;
      } else {
        // Mark as failed
        const errorData = await response.json().catch(() => ({}));
        await updateOfflineItem(item.id, { 
          status: "failed", 
          error: errorData.message || `HTTP ${response.status}` 
        });
        failed++;
      }
    } catch (error) {
      // Mark as failed
      await updateOfflineItem(item.id, { 
        status: "failed", 
        error: error instanceof Error ? error.message : 'Network error' 
      });
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * Get inspections from API
 */
export async function getInspections(query?: { status?: string; limit?: number; offset?: number }): Promise<any> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams();
  if (query?.status) params.append('status', query.status);
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.offset) params.append('offset', query.offset.toString());

  const url = `${API_BASE_URL}/v1/inspections?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user.accessToken}`,
      'x-user-id': user.id,
      'x-tenant-id': user.tenantId,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch inspections: ${response.status}`);
  }

  return response.json();
}

