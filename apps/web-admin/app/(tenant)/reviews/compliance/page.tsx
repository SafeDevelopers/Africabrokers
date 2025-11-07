import { Suspense } from "react";
import { api, ApiError } from "@/lib/api";
import { ErrorBanner } from "@/app/components/ErrorBanner";
import Link from "next/link";

interface ComplianceReport {
  id: string;
  brokerId: string;
  status: string;
  createdAt: string;
}

async function fetchComplianceReports(): Promise<ComplianceReport[]> {
  try {
    const response = await api.get<{ items: ComplianceReport[] }>("/admin/reviews/compliance");
    return response.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch compliance reports", "UNKNOWN_ERROR", 0);
  }
}

async function ComplianceReportsContent() {
  let reports: ComplianceReport[] = [];
  let error: { message: string; code: string; status: number } | null = null;
  
  try {
    reports = await fetchComplianceReports();
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
        message: "Failed to load compliance reports",
        code: "UNKNOWN_ERROR",
        status: 0,
      };
    }
  }
  
  if (error) {
    return (
      <div className="px-6 py-8">
        <ErrorBanner error={error} route="/v1/admin/reviews/compliance" />
        <Link href="/reviews" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          Back to reviews →
        </Link>
      </div>
    );
  }
  
  if (reports.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">No items</p>
          <p className="text-sm text-gray-600 mt-2">There are no compliance reports at this time.</p>
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
          <h2 className="text-lg font-semibold text-gray-900">Compliance Reports ({reports.length})</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">Compliance reports implementation coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default function ComplianceReviewsPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Compliance Reports</h1>
          <p className="text-sm text-gray-500">Regulator-ready compliance snapshots for broker oversight.</p>
        </div>
      </header>
      <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
        <ComplianceReportsContent />
      </Suspense>
    </div>
  );
}
