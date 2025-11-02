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
      try {
        const apiResult = await verifyQrCodeViaApi(qrCodeId);
        // If API succeeded, return that result
        if (apiResult.status !== 'invalid' || apiResult.broker) {
          return apiResult;
        }
      } catch (apiError) {
        // API call failed, fall through to local parsing
        console.warn('API verification failed, falling back to local parsing:', apiError);
      }
    }
  } catch (parseError) {
    // JSON parsing failed, continue with local parsing
  }

  // Fallback: Local parsing for demo/offline mode
  // This allows the app to work even without API access
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
