import { Suspense } from "react";
import { apiRequest } from "../../../lib/api-server";
import { ReviewsClient } from "./reviews-client";

interface Review {
  id: string;
  broker: {
    id: string;
    licenseNumber: string;
    licenseDocs: {
      businessName: string;
    };
    status: string;
  };
  decision: 'pending' | 'approved' | 'denied' | 'needs_revision';
  submittedAt: string;
  decidedAt?: string;
  reviewer?: {
    id: string;
    authProviderId: string;
  };
  notes?: string;
  riskFlags: string[];
  documentCount: number;
}

interface ComplianceStats {
  totalReviews: number;
  pendingReviews: number;
  approvedThisMonth: number;
  deniedThisMonth: number;
  averageReviewTime: string;
  complianceScore: number;
}

async function fetchReviews(): Promise<Review[]> {
  try {
    // Try admin endpoint first, fallback to reviews endpoint
    try {
      const data = await apiRequest<{ reviews: any[] }>('/v1/admin/reviews');
      return transformApiReviews(data.reviews || []);
    } catch {
      // Fallback to /v1/reviews/pending
      const data = await apiRequest<{ reviews: any[] }>('/v1/reviews/pending');
      return transformApiReviews(data.reviews || []);
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

function transformApiReviews(apiReviews: any[]): Review[] {
  return apiReviews.map((r: any) => ({
    id: r.id,
    broker: {
      id: r.broker?.id || r.brokerId,
      licenseNumber: r.broker?.licenseNumber || '',
      licenseDocs: {
        businessName: (r.broker?.licenseDocs as any)?.businessName || 'Unknown Broker'
      },
      status: r.broker?.status || 'submitted'
    },
    decision: r.decision || 'pending',
    submittedAt: r.createdAt || r.submittedAt || new Date().toISOString(),
    decidedAt: r.decidedAt,
    reviewer: r.reviewer ? {
      id: r.reviewer.id,
      authProviderId: r.reviewer.authProviderId || r.reviewer.email || ''
    } : undefined,
    notes: r.notes,
    riskFlags: [], // API may not include this yet
    documentCount: 0 // API may not include this yet
  }));
}

async function fetchComplianceStats(): Promise<ComplianceStats> {
  try {
    // TODO: Replace with actual admin compliance stats endpoint
    const data = await apiRequest<ComplianceStats>('/v1/admin/reviews/stats');
    return data;
  } catch (error) {
    console.error('Error fetching compliance stats:', error);
    // Return empty stats if endpoint doesn't exist
    return {
      totalReviews: 0,
      pendingReviews: 0,
      approvedThisMonth: 0,
      deniedThisMonth: 0,
      averageReviewTime: '0 days',
      complianceScore: 0,
    };
  }
}

async function ReviewsContent() {
  try {
    const [reviews, stats] = await Promise.all([
      fetchReviews(),
      fetchComplianceStats(),
    ]);

    return <ReviewsClient initialReviews={reviews} initialStats={stats} />;
  } catch (error) {
    return <ErrorDisplay error={error} />;
  }
}

function ErrorDisplay({ error }: { error: unknown }) {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Compliance</h1>
          <p className="text-sm text-gray-500">Monitor KYC reviews, compliance metrics, and audit trail</p>
        </div>
      </header>
      <main className="px-6 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-xl font-semibold text-red-900">Failed to load reviews</h2>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching reviews."}
              </p>
              <a
                href="/reviews"
                className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Try again
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
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
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </main>
        </div>
      }
    >
      <ReviewsContent />
    </Suspense>
  );
}
