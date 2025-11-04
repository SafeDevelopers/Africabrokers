"use client";

import { useState } from "react";
import { Download, RotateCw, QrCode, Eye, BarChart3 } from "lucide-react";

// Mock QR code SVG - replace with actual QR code generation from API
const mockQrCodeSvg = `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="white"/>
  <rect x="0" y="0" width="20" height="20" fill="black"/>
  <rect x="0" y="30" width="10" height="10" fill="black"/>
  <rect x="30" y="0" width="10" height="10" fill="black"/>
  <text x="128" y="128" font-family="Arial" font-size="14" text-anchor="middle" fill="#333">QR Code</text>
  <text x="128" y="140" font-family="Arial" font-size="10" text-anchor="middle" fill="#666">Verification Code</text>
</svg>`;

export default function QRPage() {
  const [qrCode, setQrCode] = useState(mockQrCodeSvg);
  const [isRotating, setIsRotating] = useState(false);
  const verifyUrl = "https://afribrok.com/verify/qr-code-12345";

  // Mock analytics data - replace with API call to GET /v1/broker/qrcode
  const analytics = {
    scanCount: 47,
    lastScannedAt: "2024-02-10T14:30:00Z",
    scans7d: 18,
    scans30d: 47,
  };

  const handleDownload = () => {
    const blob = new Blob([qrCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `broker-qr-code.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRotate = async () => {
    setIsRotating(true);
    // Mock API call - replace with POST /v1/broker/qrcode/rotate
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // In production: const response = await fetch('/api/v1/broker/qrcode/rotate', { method: 'POST' });
    // const data = await response.json();
    // setQrCode(data.svg);
    setQrCode(mockQrCodeSvg); // Mock update
    setIsRotating(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">QR Code Verification</h1>
              <p className="mt-2 text-sm text-slate-600">
                Your broker verification QR code and scan analytics
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleRotate}
                disabled={isRotating}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCw className={`w-4 h-4 ${isRotating ? "animate-spin" : ""}`} />
                Rotate Code
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* QR Code Display */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <QrCode className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-slate-900">Your QR Code</h2>
            </div>
            <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-8">
              <div dangerouslySetInnerHTML={{ __html: qrCode }} className="w-64 h-64" />
            </div>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Verification URL
              </p>
              <p className="text-sm font-mono text-slate-900 break-all">{verifyUrl}</p>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Share this QR code with clients or display it at your office for instant verification.
            </p>
          </div>

          {/* Analytics */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-slate-900">Scan Analytics</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Scans
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.scanCount}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last 7 Days
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.scans7d}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last 30 Days
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.scans30d}</p>
                  </div>
                </div>
                {analytics.lastScannedAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last Scanned
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {new Date(analytics.lastScannedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Tips */}
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-6">
              <h3 className="text-sm font-semibold text-primary mb-3">Usage Tips</h3>
              <ul className="space-y-2 text-xs text-primary/80">
                <li>• Print QR codes on business cards and marketing materials</li>
                <li>• Display QR codes at your office for walk-in verification</li>
                <li>• Share QR codes via email or messaging apps</li>
                <li>• Rotate your QR code periodically for security</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

