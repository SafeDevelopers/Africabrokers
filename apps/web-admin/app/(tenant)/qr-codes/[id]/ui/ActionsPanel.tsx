"use client";

import { useState } from "react";

// Access NEXT_PUBLIC_ env vars at module level (Next.js replaces these at build time)
const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || "http://localhost:8080";

interface ActionsPanelProps {
  qrId: string;
  code: string;
  svgString: string;
  isActive: boolean;
  verifyUrl: string;
}

export default function ActionsPanel({
  qrId,
  code,
  svgString,
  isActive,
  verifyUrl,
}: ActionsPanelProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `afribrok-qr-${code}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const action = isActive ? "revoke" : "activate";
      const res = await fetch(`${CORE_API_BASE_URL}/v1/admin/qrcodes/${encodeURIComponent(qrId)}/${action}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        alert(`Failed: ${res.status} ${txt}`);
        return;
      }

      // Reload to show updated status
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${code}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
            }
            .qr-code {
              margin: 20px 0;
            }
            .url {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>QR Code Verification</h2>
            <div class="qr-code">
              ${svgString}
            </div>
            <div class="url">${verifyUrl}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Actions</h3>

      <div className="space-y-3">
        <button
          onClick={handleDownload}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          📥 Download SVG
        </button>

        <button
          onClick={handlePrint}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          🖨️ Print
        </button>

        <button
          onClick={handleToggleStatus}
          disabled={loading}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading
            ? "Processing..."
            : isActive
            ? "⏸️ Suspend QR Code"
            : "▶️ Activate QR Code"}
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Quick Link</p>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-700 break-all block"
        >
          {verifyUrl}
        </a>
      </div>
    </div>
  );
}

