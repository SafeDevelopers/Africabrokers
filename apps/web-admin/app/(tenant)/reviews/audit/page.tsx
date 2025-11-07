import { Suspense } from "react";
import { api, ApiError } from "@/lib/api";
import { ErrorBanner } from "@/app/components/ErrorBanner";
import Link from "next/link";

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  createdAt: string;
}

async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const response = await api.get<{ items: AuditLog[] }>("/admin/reviews/audit");
    return response.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch audit logs", "UNKNOWN_ERROR", 0);
  }
}

async function AuditLogContent() {
  let logs: AuditLog[] = [];
  let error: { message: string; code: string; status: number } | null = null;
  
  try {
    logs = await fetchAuditLogs();
  } catch (err) {
    // Convert error to plain object to avoid serialization issues
    if (err instanceof ApiError) {
      error = {
        message: err.message,
        code: err.code,
        status: err.status,
      };
    } else {
      error = {
        message: "Failed to load audit logs",
        code: "UNKNOWN_ERROR",
        status: 0,
      };
    }
  }
  
  if (error) {
    return (
      <div className="px-6 py-8">
        <ErrorBanner error={error} route="/v1/admin/reviews/audit" />
        <Link href="/reviews" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          Back to reviews →
        </Link>
      </div>
    );
  }
  
  if (logs.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">No items</p>
          <p className="text-sm text-gray-600 mt-2">There are no audit logs at this time.</p>
          <Link href="/reviews" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Back to reviews →
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Audit Logs ({logs.length})</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">Audit log implementation coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Review Audit Log</h1>
          <p className="text-sm text-gray-500">Immutable audit history for broker reviews and enforcement actions.</p>
        </div>
      </header>
      <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
        <AuditLogContent />
      </Suspense>
    </div>
  );
}
