"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Eye, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/auth-context";

interface Document {
  id: string;
  name: string;
  type: string;
  status: "verified" | "pending" | "rejected" | "expired";
  uploadedAt: string;
  expiresAt?: string;
  url?: string;
}

export default function BrokerDocsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiBase = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || "http://localhost:3000";
      const tenantKey = process.env.NEXT_PUBLIC_TENANT_KEY || "et-addis";

      const response = await fetch(`${apiBase}/v1/broker/documents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant": tenantKey,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No documents endpoint yet, return empty array
          setDocuments([]);
          return;
        }
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const data = await response.json();
      setDocuments(data.items || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      let errorMessage = "Failed to load documents";
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
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Document["status"]) => {
    const badges = {
      verified: {
        icon: CheckCircle,
        className: "bg-green-100 text-green-700 border-green-200",
        label: "Verified",
      },
      pending: {
        icon: AlertCircle,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        label: "Pending Review",
      },
      rejected: {
        icon: AlertCircle,
        className: "bg-red-100 text-red-700 border-red-200",
        label: "Rejected",
      },
      expired: {
        icon: AlertCircle,
        className: "bg-orange-100 text-orange-700 border-orange-200",
        label: "Expired",
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your broker documents and certifications
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-slate-600">Loading documents...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your broker documents and certifications
        </p>
      </div>

      {error && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 shadow-sm">
          <div className="text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No documents found
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Your broker documents will appear here once they are uploaded and verified.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left max-w-md mx-auto">
              <p className="text-xs font-semibold text-slate-900 mb-2">
                Required Documents:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Brokerage License</li>
                <li>Business Registration</li>
                <li>Tax Certificate</li>
                <li>Identity Verification</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{doc.name}</h3>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Type: {doc.type}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                      {doc.expiresAt && (
                        <span>Expires: {formatDate(doc.expiresAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.url && (
                    <>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                      <a
                        href={doc.url}
                        download
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              About Document Management
            </h3>
            <p className="text-sm text-blue-700">
              All broker documents are verified by administrators. Documents must be valid for at least
              six months. You will be notified when documents are approved or if additional information is required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

