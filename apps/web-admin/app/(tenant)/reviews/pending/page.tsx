import { Suspense } from "react";
import { api, ApiError } from "@/lib/api";
import { ErrorBanner } from "@/app/components/ErrorBanner";
import { EmptyState } from "@/app/components/EmptyState";
import { ServiceInfoTooltip } from "@/app/components/ServiceInfoTooltip";
import Link from "next/link";

interface Review {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

async function fetchPendingReviews(): Promise<Review[]> {
  try {
    const response = await api.get<{ items: Review[] }>("/admin/reviews/pending");
    return response.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch pending reviews", "UNKNOWN_ERROR", 0);
  }
}

async function PendingReviewsContent() {
  let reviews: Review[] = [];
  let error: { message: string; code: string; status: number } | null = null;
  
  try {
    reviews = await fetchPendingReviews();
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
        message: "Failed to load reviews",
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
        <ErrorBanner error={error} route="/v1/admin/reviews/pending" />
        <Link href="/reviews" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-4 inline-block">
          Back to reviews overview →
        </Link>
      </div>
    );
  }
  
  // Show empty state if fetch succeeded but no items
  if (reviews.length === 0) {
    return (
      <div className="px-6 py-8">
        <EmptyState
          title="No pending reviews"
          description="There are no pending reviews at this time. New reviews will appear here when submitted."
          ctaText="Back to reviews overview"
          ctaHref="/reviews"
        />
      </div>
    );
  }
  
  return (
    <div className="px-6 py-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Reviews ({reviews.length})</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">Review list implementation coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default function PendingReviewsPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
            <ServiceInfoTooltip 
              endpoint="/v1/admin/reviews/pending" 
              endpointName="Pending Reviews"
            />
          </div>
          <p className="text-sm text-gray-500">
            Broker, property, and transaction reviews awaiting moderation.
          </p>
        </div>
      </header>
      <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
        <PendingReviewsContent />
      </Suspense>
    </div>
  );
}
