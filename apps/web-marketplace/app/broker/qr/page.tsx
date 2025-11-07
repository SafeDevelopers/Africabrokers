"use client";

import { useState, useEffect } from "react";
import { QrCode, Download, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface QRCodeData {
  id: string;
  code: string;
  status: "active" | "revoked";
  createdAt: string;
  expiresAt?: string;
  brokerId: string;
}

const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
const TENANT_KEY = process.env.NEXT_PUBLIC_TENANT_KEY;

export default function BrokerQRPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCodes = async () => {
      if (!CORE_API_BASE_URL) {
        setError("Core API base URL is not configured.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`${CORE_API_BASE_URL}/v1/admin/qrcodes?limit=20`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(TENANT_KEY ? { "X-Tenant": TENANT_KEY } : {}),
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText);
          throw new Error(
            response.status === 401 || response.status === 403
              ? "Broker QR view is restricted. Use a tenant admin account or expose a broker-specific endpoint."
              : `Failed to load QR codes: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        const items: QRCodeData[] = (data.items || []).map((item: any) => ({
          id: item.id,
          code: item.code || item.id,
          status: item.status === "REVOKED" ? "revoked" : "active",
          createdAt: item.createdAt,
          expiresAt: item.revokedAt || undefined,
          brokerId: item.subject?.id || "",
        }));

        setQrCodes(items);
      } catch (err) {
        let errorMessage = "Failed to load QR codes";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessage = String(err.message);
        }
        // Handle network errors
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          errorMessage = "Network error: Unable to connect to the API. Please check your connection and try again.";
        }
        setError(errorMessage);
        setQrCodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadQR = (qrCode: QRCodeData) => {
    // TODO: Implement QR code download
    // This would generate a QR code image and download it
    console.log("Download QR code:", qrCode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-600">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">QR Codes</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your broker verification QR codes
        </p>
      </div>

      {qrCodes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No QR Codes</h3>
          <p className="text-sm text-slate-600 mb-6">
            You don't have any QR codes yet. Once your broker application is approved, you'll receive a QR code here.
          </p>
          <Link
            href="/broker/apply"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Apply to Become a Broker
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qrCode) => (
            <div
              key={qrCode.id}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      {qrCode.code}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {qrCode.status === "active" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                        <AlertCircle className="w-3 h-3" />
                        Revoked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">QR Code ID</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-slate-100 px-2 py-1.5 text-xs font-mono text-slate-900">
                      {qrCode.code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(qrCode.code, qrCode.id)}
                      className="p-1.5 rounded hover:bg-slate-100 transition"
                      title="Copy QR code"
                    >
                      {copiedId === qrCode.id ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Verification URL</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-slate-100 px-2 py-1.5 text-xs font-mono text-slate-900 truncate">
                      {typeof window !== "undefined" && `${window.location.origin}/verify/${qrCode.code}`}
                    </code>
                    <button
                      onClick={() => copyToClipboard(
                        `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${qrCode.code}`,
                        `${qrCode.id}-url`
                      )}
                      className="p-1.5 rounded hover:bg-slate-100 transition"
                      title="Copy URL"
                    >
                      {copiedId === `${qrCode.id}-url` ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                {qrCode.expiresAt && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Expires</p>
                    <p className="text-sm text-slate-700">
                      {new Date(qrCode.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => downloadQR(qrCode)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <Link
                    href={`/verify/${qrCode.code}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <QrCode className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">About QR Codes</h3>
            <p className="text-sm text-blue-700">
              Your QR code allows customers to verify your broker status instantly. Share it on business cards,
              websites, or social media. Customers can scan it to view your verified broker profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
