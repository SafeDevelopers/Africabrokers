import AsyncStorage from "@react-native-async-storage/async-storage";
import type { VerifyResult } from "./api";

const HISTORY_KEY = "@afribrok_inspector_history";

export type HistoryItem = VerifyResult & {
  id: string;
  scannedAt: string;
  qrCodeId?: string;
};

/**
 * Add a verification result to history
 */
export async function addHistory(result: VerifyResult & { qrCodeId?: string }): Promise<void> {
  try {
    const existing = await getHistory();
    const newItem: HistoryItem = {
      ...result,
      id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      scannedAt: new Date().toISOString(),
      qrCodeId: result.qrCodeId,
    };
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([newItem, ...existing]));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

/**
 * Get all history items
 */
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
}

/**
 * Clear all history
 */
export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}

