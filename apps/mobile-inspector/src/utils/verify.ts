import Constants from 'expo-constants';
import { verifyQrCodeViaApi } from './api';

export type VerifyResult = {
  status: "verified" | "warning" | "invalid";
  broker?: {
    id: string;
    name: string;
    license: string;
    approved: boolean;
    rating?: number;
    approvedAt?: string;
    strikeCount?: number;
  };
  message?: string;
};

/**
 * Check if offline mode is enabled
 */
function isOfflineModeEnabled(): boolean {
  // Production builds never import or start mocks
  // In development, behind explicit flag (e.g., EXPO_PUBLIC_ENABLE_MOCKS=true)
  if (process.env.NODE_ENV === 'production') {
    return false; // Never enable offline mode in production
  }
  
  const offlineFlag = Constants.expoConfig?.extra?.inspectorOffline ||
                      process.env.EXPO_PUBLIC_INSPECTOR_OFFLINE ||
                      process.env.EXPO_PUBLIC_ENABLE_MOCKS ||
                      'disabled';
  return offlineFlag.toLowerCase() === 'enabled' || offlineFlag.toLowerCase() === 'true';
}

/**
 * Verify QR code - attempts API verification first, falls back to local parsing
 * This supports both real API calls and offline/local QR parsing
 */
export async function verifyFromQR(raw: string): Promise<VerifyResult> {
  // First, try to extract QR code ID from the raw string
  // QR codes from AfriBrok should contain an ID like "AFR-QR-156" or just the ID
  let qrCodeId: string | null = null;

  try {
    // Try to parse as JSON first
    if (raw.trim().startsWith("{")) {
      const payload = JSON.parse(raw);
      qrCodeId = payload.id || payload.qrCodeId || payload.code || null;
    } else {
      // Try key=value format
      const parts = raw.split(/[;,&]/);
      for (const part of parts) {
        const [key, value] = part.split("=").map(s => s.trim());
        if (key && (key.toLowerCase() === 'id' || key.toLowerCase() === 'code' || key.toLowerCase() === 'qrcode')) {
          qrCodeId = value;
          break;
        }
        // If it looks like a QR code format (AFR-QR-XXX)
        if (/^AFR-QR-\d+$/i.test(value || key)) {
          qrCodeId = value || key;
          break;
        }
      }
      // If no ID found, check if the whole string is a QR code ID
      if (!qrCodeId && /^AFR-QR-\d+$/i.test(raw.trim())) {
        qrCodeId = raw.trim();
      }
    }

    // If we found a QR code ID, try API verification
    if (qrCodeId) {
      const apiResult = await verifyQrCodeViaApi(qrCodeId);
      
      // Check if API call succeeded (has broker or valid status)
      const apiSucceeded = apiResult.status !== 'invalid' || apiResult.broker;
      
      if (apiSucceeded) {
        // API succeeded, return that result
        return apiResult;
      }
      
      // API returned invalid status (network error or API error)
      const offlineEnabled = isOfflineModeEnabled();
      
      if (!offlineEnabled) {
        // Offline mode is disabled - throw error instead of falling back
        // Check if it's a network error (message contains "Unable to connect" or "Network error")
        const isNetworkError = apiResult.message?.toLowerCase().includes('unable to connect') ||
                               apiResult.message?.toLowerCase().includes('network error');
        
        if (isNetworkError) {
          throw new Error(apiResult.message || 'API verification failed. Please check your connection and try again.');
        }
        
        // API returned an error (not network), still throw in offline-disabled mode
        throw new Error(apiResult.message || 'API verification failed. Please try again.');
      }
      
      // Offline mode is enabled - fall through to local parsing
      console.warn('API verification failed, falling back to local parsing:', apiResult.message);
    }
  } catch (parseError) {
    // JSON parsing failed, continue with local parsing only if offline mode is enabled
    const offlineEnabled = isOfflineModeEnabled();
    if (!offlineEnabled && qrCodeId) {
      // If we have a QR code ID but offline is disabled, this is an error
      throw new Error('Unable to verify QR code. API verification required but failed.');
    }
  }

  // Fallback: Local parsing for demo/offline mode
  // This allows the app to work even without API access
  // Only if offline mode is enabled
  const offlineEnabled = isOfflineModeEnabled();
  if (!offlineEnabled) {
    // Offline mode is disabled - return error instead of local parsing
    return {
      status: 'invalid',
      message: 'API verification required but failed. Please check your connection and try again.',
    };
  }

  try {
    let payload: any = null;
    if (raw.trim().startsWith("{")) {
      payload = JSON.parse(raw);
    } else {
      payload = raw.split(/[;,&]/).reduce((acc: any, part) => {
        const [k, v] = part.split("=").map(s => s.trim());
        if (k) acc[k] = (v ?? "").trim();
        return acc;
      }, {});
    }

    const approved = String(payload.approved ?? payload.status ?? "").toLowerCase().includes("true") ||
      String(payload.status ?? "").toLowerCase() === "approved";

    if (approved) {
      return {
        status: "verified",
        broker: {
          id: String(payload.id ?? payload.brokerId ?? "unknown"),
          name: String(payload.name ?? "Verified Broker"),
          license: String(payload.license ?? payload.licenseNo ?? payload.licenseNumber ?? "N/A"),
          approved: true
        },
        message: "Broker is approved and active. (Local verification)"
      };
    }

    if (payload.id || payload.name) {
      return {
        status: "warning",
        broker: {
          id: String(payload.id ?? "unknown"),
          name: String(payload.name ?? "Unknown"),
          license: String(payload.license ?? payload.licenseNo ?? "N/A"),
          approved: false
        },
        message: "QR scanned but the broker is not approved. (Local verification)"
      };
    }

    return { status: "invalid", message: "Unrecognized QR data format." };
  } catch (e) {
    return { status: "invalid", message: "Unrecognized QR data." };
  }
}
