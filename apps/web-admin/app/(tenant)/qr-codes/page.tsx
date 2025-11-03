"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import QRCode from "qrcode";

// ---- Types & schema (align with backend contract) ----
const QrItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  code: z.string(), // qrCodeId
  status: z.enum(["ACTIVE", "REVOKED"]).default("ACTIVE"),
  createdAt: z.string(),
  lastScanned: z.string().nullable().optional(),
  scanCount: z.number().default(0),
  subjectType: z.enum(["BROKER", "LISTING"]),
  subject: z.object({
    id: z.string(),
    licenseNumber: z.string().optional(),
    licenseDocs: z.object({ businessName: z.string().optional() }).optional(),
    title: z.string().optional(),
    rating: z.number().nullable().optional(),
    status: z.string().optional()
  }).optional()
});

type QrItem = z.infer<typeof QrItemSchema>;

const ListSchema = z.object({
  items: z.array(QrItemSchema),
  total: z.number().optional().default(0)
});

const CORE = process.env.NEXT_PUBLIC_CORE_API_BASE_URL ?? "http://localhost:8080";
const VERIFY_BASE = process.env.NEXT_PUBLIC_VERIFY_BASE_URL ?? "https://verify.afribrok.com";

async function fetchQRCodes(signal?: AbortSignal): Promise<QrItem[]> {
  // Use API client with automatic X-Tenant header (client-side)
  const { apiClient } = await import('../../../lib/api-client');
  
  const data = await apiClient.get('/admin/qrcodes?limit=60', {
    includeTenant: true, // Include X-Tenant header for tenant admin
  });
  
  const parsed = ListSchema.parse(Array.isArray(data) ? { items: data } : data);
  return parsed.items;
}

function statusChipColor(item: QrItem) {
  // Map to your UI chips
  if (item.status === "REVOKED") return "bg-yellow-100 text-yellow-800";
  // You may want EXPIRED from subject’s license—if you compute it server-side, add `publicStatus` to DTO
  return "bg-green-100 text-green-800"; // ACTIVE
}

function displayName(item: QrItem) {
  if (item.subjectType === "BROKER") {
    return item.subject?.licenseDocs?.businessName || "Broker";
  }
  return item.subject?.title || "Listing";
}

function verifyUrl(item: QrItem) {
  return `${VERIFY_BASE}/verify/${encodeURIComponent(item.code)}`;
}

function formatDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

async function svgFromUrl(url: string) {
  return QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 1, width: 256, color: { dark: "#000", light: "#fff" } });
}

export default function QRCodesPage() {
  const [items, setItems] = useState<QrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [svgs, setSvgs] = useState<Record<string, string>>({}); // code -> svg
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const data = await fetchQRCodes(ac.signal);
        setItems(data);
        // Pre-generate SVGs (fast; avoids client QR libs per-card)
        const entries = await Promise.all(
          data.map(async it => [it.code, await svgFromUrl(verifyUrl(it))] as const)
        );
        setSvgs(Object.fromEntries(entries));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter(it => {
      const matchesSearch =
        !q ||
        displayName(it).toLowerCase().includes(q) ||
        (it.subject?.licenseNumber ?? "").toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ? true :
        statusFilter === "active" ? it.status === "ACTIVE" :
        statusFilter === "suspended" ? it.status === "REVOKED" : // UI “suspended” maps to REVOKED (or add a real SUSPENDED in DTO)
        statusFilter === "expired" ? false /* if you expose EXPIRED server-side, check it here */ :
        true;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const all = items.length;
    const active = items.filter(it => it.status === "ACTIVE").length;
    const suspended = items.filter(it => it.status === "REVOKED").length;
    const expired = 0; // if backend exposes EXPIRED, compute here
    return { all, active, suspended, expired };
  }, [items]);

  const totalScans = useMemo(() => items.reduce((sum, it) => sum + (it.scanCount ?? 0), 0), [items]);

  async function handleBulkGenerate() {
    // POST to a bulk endpoint; for now no-op
    alert("TODO: POST /v1/admin/qrcodes/bulk-generate");
  }

  async function handlePrintPack() {
    // Either open a server-rendered print page or generate a PDF on server
    alert("TODO: Build a print pack (server-rendered) for crisp output");
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </header>
        <main className="px-6 py-8">
          <div className="space-y-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-700 font-medium">Failed to load: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
              <p className="text-sm text-gray-500">Manage verification QRs and print packs</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={handleBulkGenerate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Generate Missing QRs
              </button>
              <button onClick={handlePrintPack} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                📄 Generate Print Pack
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard value={items.length} label="Total QR Codes" accent="text-indigo-600" />
            <StatCard value={statusCounts.active} label="Active Codes" accent="text-green-600" />
            <StatCard value={totalScans} label="Total Scans" accent="text-orange-600" />
            <StatCard value={statusCounts.suspended} label="Suspended" accent="text-red-600" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by business name, license, or code…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* QR Codes Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No QR codes found.</p>
              </div>
            ) : (
              filtered.map((qr) => (
                <QRCodeCard key={qr.id} qr={qr} svg={svgs[qr.code]} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center">
        <p className={`text-3xl font-bold ${accent}`}>{value}</p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );
}

function QRCodeCard({ qr, svg }: { qr: QrItem; svg?: string }) {
  const chip = statusChipColor(qr);
  const name = displayName(qr);
  const vUrl = verifyUrl(qr);

  async function onDownload() {
    // Prefer SVG (crisp print). If you must, fall back to vUrl as QR reconstructor.
    if (!svg) return alert("QR not ready yet");
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `afribrok-qr-${qr.code}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function toggleStatus() {
    const next = qr.status === "ACTIVE" ? "revoke" : "activate";
    const { apiClient } = await import('../../../../lib/api-client');
    
    try {
      await apiClient.post(`/admin/qrcodes/${encodeURIComponent(qr.id)}/${next}`, undefined, {
        includeTenant: true,
      });
      // Optimistic UI: reload or mutate local state (simplest: hard reload)
      location.reload();
    } catch (error: any) {
      alert(`Failed: ${error.message || 'Unknown error'}`);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-600">
            {qr.subject?.licenseNumber ?? qr.subject?.id}
          </p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${chip}`}>
          {qr.status}
        </span>
      </div>

      {/* QR Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-3 text-center border">
        {svg ? (
          // eslint-disable-next-line react/no-danger
          <div className="mx-auto w-28 h-28" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="w-28 h-28 bg-gray-200 rounded mx-auto" />
        )}
        <p className="text-[11px] text-gray-500 break-all mt-2">{vUrl}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Scans</p>
          <p className="font-semibold">{qr.scanCount ?? 0}</p>
        </div>
        <div>
          <p className="text-gray-500">Created</p>
          <p className="font-semibold">{formatDate(qr.createdAt)}</p>
        </div>
        <div>
          <p className="text-gray-500">Last Scan</p>
          <p className="font-semibold">{formatDate(qr.lastScanned ?? undefined)}</p>
        </div>
        <div>
          <p className="text-gray-500">Subject</p>
          <p className="font-semibold">{qr.subjectType}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onDownload}
          className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Download
        </button>
        <button
          onClick={toggleStatus}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
            qr.status === "ACTIVE"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          {qr.status === "ACTIVE" ? "Suspend" : "Activate"}
        </button>
      </div>

      <div className="mt-3">
        <Link href={qr.subjectType === "BROKER" ? `/brokers/${qr.subject?.id}` : `/listings/${qr.subject?.id}`} className="text-sm text-indigo-600 hover:text-indigo-700">
          View {qr.subjectType} →
        </Link>
      </div>
    </div>
  );
}