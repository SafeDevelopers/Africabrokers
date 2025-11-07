import { Suspense } from "react";
import { api, ApiError } from "@/lib/api";
import { ErrorBanner } from "@/app/components/ErrorBanner";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  status: string;
  submittedAt: string;
}

async function fetchPendingListings(): Promise<Listing[]> {
  try {
    const response = await api.get<{ items: Listing[] }>("/admin/listings/pending");
    return response.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch pending listings", "UNKNOWN_ERROR", 0);
  }
}

async function PendingListingsContent() {
  let listings: Listing[] = [];
  let error: ApiError | null = null;
  
  try {
    listings = await fetchPendingListings();
  } catch (err) {
    error = err instanceof ApiError ? err : new ApiError("Failed to load pending listings", "UNKNOWN_ERROR", 0);
  }
  
  if (error) {
    return (
      <div className="px-6 py-8">
        <ErrorBanner error={error} route="/v1/admin/listings/pending" onRetry={() => window.location.reload()} />
        <Link href="/listings" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          Back to listings overview →
        </Link>
      </div>
    );
  }
  
  if (listings.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">No items</p>
          <p className="text-sm text-gray-600 mt-2">There are no pending listings at this time.</p>
          <Link href="/listings" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Back to listings overview →
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Listings ({listings.length})</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">Pending listings implementation coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default function PendingListingsPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Pending Listings</h1>
          <p className="text-sm text-gray-500">Listings awaiting moderation or additional review.</p>
        </div>
      </header>
      <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
        <PendingListingsContent />
      </Suspense>
    </div>
  );
}
