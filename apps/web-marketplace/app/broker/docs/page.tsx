"use client";

import { useState } from "react";
import { FileText, Upload, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react";

type DocStatus = "verified" | "pending" | "expired" | "missing";

interface Document {
  id: string;
  name: string;
  type: string;
  status: DocStatus;
  uploadedAt?: string;
  expiresAt?: string;
  fileUrl?: string;
}

// Mock documents - replace with API call
const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Real Estate License",
    type: "License",
    status: "verified",
    uploadedAt: "2024-01-15",
    expiresAt: "2025-12-31",
    fileUrl: "/docs/license.pdf",
  },
  {
    id: "doc-2",
    name: "Business Registration",
    type: "Registration",
    status: "verified",
    uploadedAt: "2024-01-15",
    expiresAt: "2026-01-15",
    fileUrl: "/docs/business.pdf",
  },
  {
    id: "doc-3",
    name: "Code of Conduct",
    type: "Agreement",
    status: "verified",
    uploadedAt: "2024-01-15",
  },
  {
    id: "doc-4",
    name: "Insurance Certificate",
    type: "Certificate",
    status: "expired",
    uploadedAt: "2023-06-01",
    expiresAt: "2024-06-01",
  },
];

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Verified",
  },
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    label: "Pending Review",
  },
  expired: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    label: "Expired",
  },
  missing: {
    icon: AlertCircle,
    color: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
    label: "Not Uploaded",
  },
};

export default function DocsPage() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (docId: string) => {
    setUploading(docId);
    // Mock upload - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, status: "pending" as DocStatus, uploadedAt: new Date().toISOString().split("T")[0] } : doc
      )
    );
    setUploading(null);
  };

  const expiredDocs = documents.filter((doc) => doc.status === "expired");
  const renewalNeeded = expiredDocs.length > 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">KYC Vault</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage your documents and keep your broker profile up to date
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-8">
        <div className="space-y-6">
          {/* Renewal CTA */}
          {renewalNeeded && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-red-900">Renewal Required</h2>
              </div>
              <p className="text-sm text-red-700 mb-4">
                {expiredDocs.length} document{expiredDocs.length > 1 ? "s" : ""} {expiredDocs.length > 1 ? "have" : "has"} expired and need to be renewed.
              </p>
              <div className="space-y-2">
                {expiredDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                    <div>
                      <p className="font-semibold text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-600">
                        Expired: {doc.expiresAt}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpload(doc.id)}
                      disabled={uploading === doc.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className={`w-4 h-4 ${uploading === doc.id ? "animate-spin" : ""}`} />
                      {uploading === doc.id ? "Uploading..." : "Upload Renewal"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents List */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Your Documents</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {documents.map((doc) => {
                const config = statusConfig[doc.status];
                const Icon = config.icon;

                return (
                  <div key={doc.id} className={`p-6 ${config.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`rounded-lg bg-white p-3 ${config.color}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${config.color} bg-white`}>
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{doc.type}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            {doc.uploadedAt && (
                              <span>Uploaded: {doc.uploadedAt}</span>
                            )}
                            {doc.expiresAt && (
                              <span>Expires: {doc.expiresAt}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            download
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        )}
                        {doc.status === "missing" || doc.status === "expired" ? (
                          <button
                            onClick={() => handleUpload(doc.id)}
                            disabled={uploading === doc.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Upload className={`w-4 h-4 ${uploading === doc.id ? "animate-spin" : ""}`} />
                            {uploading === doc.id ? "Uploading..." : "Upload"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpload(doc.id)}
                            disabled={uploading === doc.id}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Upload className={`w-4 h-4 ${uploading === doc.id ? "animate-spin" : ""}`} />
                            {uploading === doc.id ? "Uploading..." : "Replace"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

