import { Suspense } from "react";
import { api, ApiError } from "@/lib/api";
import { ErrorBanner } from "@/app/components/ErrorBanner";
import { EmptyState } from "@/app/components/EmptyState";
import { ServiceInfoTooltip } from "@/app/components/ServiceInfoTooltip";
import Link from "next/link";

interface Verification {
  id: string;
  subjectType: 'BROKER' | 'AGENCY' | 'DRIVER';
  subjectId: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

async function fetchPendingVerifications(): Promise<Verification[]> {
  try {
    const response = await api.get<{ items: Verification[] }>("/admin/verifications/pending");
    return response.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch pending verifications", "UNKNOWN_ERROR", 0);
  }
}

async function PendingVerificationsContent() {
  let verifications: Verification[] = [];
  let error: { message: string; code: string; status: number } | null = null;
  
  try {
    verifications = await fetchPendingVerifications();
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
        message: "Failed to load verifications",
        code: "UNKNOWN_ERROR",
        status: 0,
      };
    }
  }
  
  // Show error banner only for 404/Network errors
  const isNetworkOrNotFound = error && (
    error.status === 0 || 
    error.status === 404 || 
    error.code === 'NETWORK_ERROR'
  );
  
  if (isNetworkOrNotFound) {
    return (
      <div className="px-6 py-8">
        <ErrorBanner error={error} route="/v1/admin/verifications/pending" />
        <Link href="/brokers/verification" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-4 inline-block">
          Back to verification queue →
        </Link>
      </div>
    );
  }
  
  // Show empty state if fetch succeeded but no items
  if (verifications.length === 0) {
    return (
      <div className="px-6 py-8">
        <EmptyState
          title="No pending verifications"
          description="There are no pending verifications at this time. New verifications will appear here when submitted."
          ctaText="Back to verification queue"
          ctaHref="/brokers/verification"
        />
      </div>
    );
  }
  
  return (
    <div className="px-6 py-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Verifications ({verifications.length})</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">Verification list implementation coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default function PendingVerificationsPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Pending Verifications</h1>
            <ServiceInfoTooltip 
              endpoint="/v1/admin/verifications/pending" 
              endpointName="Pending Verifications"
            />
          </div>
          <p className="text-sm text-gray-500">
            Broker, agency, and driver verifications awaiting review.
          </p>
        </div>
      </header>
      <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
        <PendingVerificationsContent />
      </Suspense>
    </div>
  );
}

