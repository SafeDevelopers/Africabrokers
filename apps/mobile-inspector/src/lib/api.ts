import { verifyFromQR } from "../utils/verify";

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
 * Verify QR code by ID (wrapper around verifyFromQR)
 */
export async function verifyByQr(qrCodeId: string): Promise<VerifyResult> {
  return await verifyFromQR(qrCodeId);
}

