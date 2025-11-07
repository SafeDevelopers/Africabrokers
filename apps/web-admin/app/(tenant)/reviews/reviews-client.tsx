"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

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

type ReviewsClientProps = {
  initialReviews: Review[];
  initialStats: ComplianceStats;
};

export function ReviewsClient({ initialReviews, initialStats }: ReviewsClientProps) {
  const [reviews] = useState<Review[]>(initialReviews);
  const [stats] = useState<ComplianceStats>(initialStats);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      return statusFilter === "all" || review.decision === statusFilter;
    });
  }, [reviews, statusFilter]);

  const statusCounts = useMemo(() => ({
    all: reviews.length,
    pending: reviews.filter(r => r.decision === 'pending').length,
    approved: reviews.filter(r => r.decision === 'approved').length,
    denied: reviews.filter(r => r.decision === 'denied').length,
    needs_revision: reviews.filter(r => r.decision === 'needs_revision').length,
  }), [reviews]);

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reviews & Compliance</h1>
              <p className="text-sm text-gray-500">
                Monitor KYC reviews, compliance metrics, and audit trail
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/reviews/pending"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
              >
                Review Queue ({statusCounts.pending})
              </Link>
              <Link
                href="/reviews/compliance"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Generate Report
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingReviews}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Require immediate attention</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Review Time</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.averageReviewTime}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Trend data will appear once analytics are connected.</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedThisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stats.deniedThisMonth} denied</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.complianceScore}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Compliance trends require telemetry integration.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/reviews/pending"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pending Reviews</h3>
                  <p className="text-sm text-gray-600">Process broker KYC applications</p>
                  {statusCounts.pending > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 mt-2">
                      {statusCounts.pending} pending
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <Link
              href="/reviews/compliance"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Compliance Reports</h3>
                  <p className="text-sm text-gray-600">Generate regulatory compliance reports</p>
                </div>
              </div>
            </Link>

            <Link
              href="/reviews/audit"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Audit Logs</h3>
                  <p className="text-sm text-gray-600">View system audit trail and changes</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
                <div className="flex space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                    <option value="needs_revision">Needs Revision</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredReviews.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No reviews found matching your criteria.</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewRow key={review.id} review={review} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ReviewRow({ review }: { review: Review }) {
  const statusColors = {
    pending: "bg-orange-100 text-orange-800",
    approved: "bg-green-100 text-green-800",
    denied: "bg-red-100 text-red-800",
    needs_revision: "bg-yellow-100 text-yellow-800"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskFlagIcon = (flag: string) => {
    const flagIcons: Record<string, string> = {
      document_quality: "📄",
      identity_mismatch: "🆔",
      business_verification: "🏢",
      address_verification: "📍",
      financial_records: "💰"
    };
    return flagIcons[flag] || "⚠️";
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {review.broker.licenseDocs.businessName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {review.broker.licenseDocs.businessName}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[review.decision]}`}>
                  {review.decision.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                <span>📄 {review.broker.licenseNumber}</span>
                <span>📁 {review.documentCount} documents</span>
                <span>📅 Submitted {formatDate(review.submittedAt)}</span>
                {review.decidedAt && (
                  <span>✅ Decided {formatDate(review.decidedAt)}</span>
                )}
              </div>

              {review.riskFlags.length > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Risk Flags:</span>
                  {review.riskFlags.map((flag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {getRiskFlagIcon(flag)} {flag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}

              {review.notes && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 italic">"{review.notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {review.reviewer && (
            <div className="text-right text-xs text-gray-500">
              <p>Reviewed by</p>
              <p className="font-medium">{review.reviewer.authProviderId}</p>
            </div>
          )}
          <Link
            href={`/reviews/${review.id}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
