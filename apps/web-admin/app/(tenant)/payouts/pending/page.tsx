import { Suspense } from "react";
import { api, ApiError } from "@/lib/api";
import { ErrorBanner } from "@/app/components/ErrorBanner";
import { EmptyState } from "@/app/components/EmptyState";
import { ServiceInfoTooltip } from "@/app/components/ServiceInfoTooltip";
import Link from "next/link";

interface Payout {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  requestedAt: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
}

async function fetchPendingPayouts(): Promise<Payout[]> {
  try {
    const response = await api.get<{ items: Payout[] }>("/admin/payouts/pending");
    return response.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch pending payouts", "UNKNOWN_ERROR", 0);
  }
}

async function PendingPayoutsContent() {
  let payouts: Payout[] = [];
  let error: { message: string; code: string; status: number } | null = null;
  
  try {
    payouts = await fetchPendingPayouts();
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
        message: "Failed to load payouts",
        code: "UNKNOWN_ERROR",
        status: 0,
      };
    }
  }
  
  // Show error banner only for 404/Network errors
  if (error && (
    error.status === 0 || 
    error.status === 404 || 
    error.code === 'NETWORK_ERROR'
  )) {
    return (
      <div className="px-6 py-8">
        <ErrorBanner error={error} route="/v1/admin/payouts/pending" />
        <Link href="/billing/invoices" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-4 inline-block">
          Back to billing →
        </Link>
      </div>
    );
  }
  
  // Show empty state if fetch succeeded but no items
  if (payouts.length === 0) {
    return (
      <div className="px-6 py-8">
        <EmptyState
          title="No pending payouts"
          description="There are no pending payouts at this time. New payout requests will appear here when submitted."
          ctaText="Back to billing"
          ctaHref="/billing/invoices"
        />
      </div>
    );
  }
  
  return (
    <div className="px-6 py-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Payouts ({payouts.length})</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">Payout list implementation coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default function PendingPayoutsPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Pending Payouts</h1>
            <ServiceInfoTooltip 
              endpoint="/v1/admin/payouts/pending" 
              endpointName="Pending Payouts"
            />
          </div>
          <p className="text-sm text-gray-500">
            Payout requests awaiting processing.
          </p>
        </div>
      </header>
      <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
        <PendingPayoutsContent />
      </Suspense>
    </div>
  );
}

