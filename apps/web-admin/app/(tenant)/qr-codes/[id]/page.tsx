// Server component – loads QR code + subject detail and renders real SVG QR.
// Requires: npm i zod qrcode (or add to your workspace)

import { notFound } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import QRCode from "qrcode";
import React from "react";
import ActionsPanel from "./ui/ActionsPanel";

const QrSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  code: z.string(), // the <qrCodeId>
  subjectType: z.enum(["BROKER", "LISTING"]),
  subjectId: z.string(),
  createdAt: z.string(),
  revokedAt: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "REVOKED"]).default("ACTIVE"),
  metaJson: z.any().optional(),

  // Optional expanded subject info from your API
  subject: z
    .object({
      name: z.string().optional(),
      title: z.string().optional(),
      licenseNo: z.string().optional(),
    })
    .optional(),
});

type QrCodeDto = z.infer<typeof QrSchema>;

async function getQrDetail(id: string, cookies: string | undefined): Promise<QrCodeDto | null> {
  // Use API client with automatic X-Tenant header
  const { apiClient } = await import('@/lib/api-client');
  
  try {
    const data = await apiClient.get(`/admin/qrcodes/${encodeURIComponent(id)}`, {
      includeTenant: true, // Include X-Tenant header for tenant admin
      cookies, // Forward cookies for server-side requests
    });
    return QrSchema.parse(data);
  } catch (error: any) {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return null;
    }
    throw error;
  }
}

function tenantVerifyOrigin(tenantId: string) {
  // If you use per-tenant verify hostnames, compute here. Otherwise a single host is fine.
  // e.g. return `https://verify.${tenantId}.afribrok.com`;
  const base = process.env.NEXT_PUBLIC_VERIFY_BASE_URL ?? "https://verify.afribrok.com";
  return base;
}

export default async function QRDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Get cookies from request headers for server-side API calls
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  const qr = await getQrDetail(id, cookieString);
  if (!qr) notFound();

  const verifyUrl = `${tenantVerifyOrigin(qr.tenantId)}/verify/${encodeURIComponent(qr.code)}`;

  // Render SVG on the server (print-perfect)
  const svgString = await QRCode.toString(verifyUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#000000", light: "#FFFFFF" },
  });

  const isActive = qr.status === "ACTIVE" && !qr.revokedAt;

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Code Details</h1>
              <p className="text-sm text-gray-500">Manage verification QR for {qr.subjectType.toLowerCase()}</p>
            </div>
            <Link href="/qr-codes" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to QR Codes
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Overview */}
          <section className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">QR Code</p>
                <p className="font-medium text-gray-900">{qr.code}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {isActive ? "ACTIVE" : "REVOKED"}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tenant</p>
                <p className="font-medium text-gray-900">{qr.tenantId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium text-gray-900">
                  {qr.subjectType} {qr.subject?.name || qr.subject?.title ? `• ${qr.subject?.name ?? qr.subject?.title}` : ""}
                </p>
              </div>

              {qr.subject?.licenseNo && (
                <div>
                  <p className="text-sm text-gray-500">License #</p>
                  <p className="font-medium text-gray-900">{qr.subject.licenseNo}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Deep Link</p>
                <p className="font-mono text-sm text-gray-900 break-all">{verifyUrl}</p>
              </div>

              {/* SVG Preview */}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Preview</p>
                <div className="mt-2 bg-white border border-gray-200 rounded p-4 flex items-center justify-center h-auto">
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: svgString }} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  This SVG is generated server-side and matches the deep link above.
                </p>
              </div>
            </div>
          </section>

          {/* Actions (client) */}
          <aside className="space-y-6">
            <ActionsPanel
              qrId={qr.id}
              code={qr.code}
              svgString={svgString}
              isActive={isActive}
              verifyUrl={verifyUrl}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}