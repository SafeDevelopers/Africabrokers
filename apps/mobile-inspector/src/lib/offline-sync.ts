import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFLINE_QUEUE_KEY = "@afribrok_inspector_offline_queue";

export interface OfflineInspection {
  id: string;
  qrCodeId: string;
  verificationResult: any;
  violationType?: string;
  violationNotes?: string;
  location?: { latitude: number; longitude: number };
  photos?: string[];
  createdAt: string;
  status: "pending_sync" | "syncing" | "synced" | "failed";
  error?: string;
}

/**
 * Add inspection to offline queue
 */
export async function addToOfflineQueue(inspection: Omit<OfflineInspection, "id" | "createdAt" | "status">): Promise<string> {
  try {
    const queue = await getOfflineQueue();
    const newInspection: OfflineInspection = {
      ...inspection,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      status: "pending_sync",
    };
    
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([...queue, newInspection]));
    return newInspection.id;
  } catch (error) {
    console.error("Failed to add to offline queue:", error);
    throw error;
  }
}

/**
 * Get all pending sync items
 */
export async function getOfflineQueue(): Promise<OfflineInspection[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load offline queue:", error);
    return [];
  }
}

/**
 * Get pending sync items only
 */
export async function getPendingSyncItems(): Promise<OfflineInspection[]> {
  const queue = await getOfflineQueue();
  return queue.filter(item => item.status === "pending_sync" || item.status === "failed");
}

/**
 * Update inspection status in queue
 */
export async function updateOfflineItem(id: string, updates: Partial<OfflineInspection>): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const updated = queue.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update offline item:", error);
  }
}

/**
 * Remove synced item from queue
 */
export async function removeFromOfflineQueue(id: string): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove from offline queue:", error);
  }
}

/**
 * Clear entire offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error("Failed to clear offline queue:", error);
  }
}

