"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface PendingReview {
  id: string;
  type: 'broker_review' | 'property_review' | 'transaction_review';
  target: {
    id: string;
    name: string;
    type: 'broker' | 'property' | 'transaction';
  };
  reviewer: {
    id: string;
    email: string;
    type: 'buyer' | 'seller' | 'tenant' | 'landlord';
  };
  rating: number;
  title: string;
  content: string;
  submittedAt: string;
  status: 'pending_moderation' | 'under_review' | 'flagged';
  flags?: string[];
  moderationNotes?: string;
  photos?: number;
}

const mockPendingReviews: PendingReview[] = [
  {
    id: "review-p1",
    type: "broker_review",
    target: {
      id: "broker-1",
      name: "Tadesse Real Estate",
      type: "broker"
    },
    reviewer: {
      id: "user-123",
      email: "satisfied.buyer@gmail.com",
      type: "buyer"
    },
    rating: 5,
    title: "Excellent service and very professional",
    content: "Alemayehu was incredibly helpful throughout the entire buying process. He showed us multiple properties, was very knowledgeable about the market, and helped us negotiate a fair price. Highly recommend!",
    submittedAt: "2024-01-22T14:30:00Z",
    status: "pending_moderation",
    photos: 2
  },
  {
    id: "review-p2",
    type: "property_review",
    target: {
      id: "property-456",
      name: "Modern Apartment in Bole",
      type: "property"
    },
    reviewer: {
      id: "user-789",
      email: "new.tenant@outlook.com",
      type: "tenant"
    },
    rating: 2,
    title: "Not as advertised, several issues",
    content: "The apartment looks nothing like the photos. The 'modern' finishes are cheap and already falling apart. Water pressure is terrible and the neighbors are extremely loud. Would not recommend.",
    submittedAt: "2024-01-22T11:15:00Z",
    status: "under_review",
    flags: ["Potentially fake", "Negative language"],
    moderationNotes: "Investigating claims - reached out to broker for response"
  },
  {
    id: "review-p3",
    type: "transaction_review",
    target: {
      id: "transaction-789",
      name: "Villa Sale - Ayat Real Estate",
      type: "transaction"
    },
    reviewer: {
      id: "user-456",
      email: "happy.seller@protonmail.com",
      type: "seller"
    },
    rating: 4,
    title: "Smooth transaction overall",
    content: "The sale process went smoothly. Documentation was handled professionally and we closed on time. Only minor issue was some confusion about closing costs but it was resolved quickly.",
    submittedAt: "2024-01-21T16:45:00Z",
    status: "pending_moderation"
  },
  {
    id: "review-p4",
    type: "broker_review",
    target: {
      id: "broker-2",
      name: "Prime Properties Ltd",
      type: "broker"
    },
    reviewer: {
      id: "user-999",
      email: "suspicious.reviewer@tempmail.com",
      type: "buyer"
    },
    rating: 1,
    title: "Terrible broker avoid at all costs!!!",
    content: "This broker is SCAM!!! They took my deposit and disappeared. NEVER WORK WITH THEM! Complete fraud operation. I lost 50,000 birr!!!",
    submittedAt: "2024-01-21T09:30:00Z",
    status: "flagged",
    flags: ["Spam indicators", "Excessive caps", "Fraud claims", "Suspicious email"],
    moderationNotes: "Multiple red flags - appears to be fake review. No transaction records found."
  }
];

export default function PendingReviewsPage() {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setReviews(mockPendingReviews);
      setLoading(false);
    }, 800);
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = statusFilter === "all" || review.status === statusFilter;
    const matchesType = typeFilter === "all" || review.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const statusCounts = {
    all: reviews.length,
    pending_moderation: reviews.filter(r => r.status === 'pending_moderation').length,
    under_review: reviews.filter(r => r.status === 'under_review').length,
    flagged: reviews.filter(r => r.status === 'flagged').length,
  };

  const typeCounts = {
    broker_review: reviews.filter(r => r.type === 'broker_review').length,
    property_review: reviews.filter(r => r.type === 'property_review').length,
    transaction_review: reviews.filter(r => r.type === 'transaction_review').length,
  };

  if (loading) {
    return (
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
              <p className="text-sm text-gray-500">
                Moderate and approve user reviews for brokers, properties, and transactions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/reviews"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to Reviews Overview
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatusCard
              label="Total Pending"
              count={statusCounts.all}
              color="gray"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <StatusCard
              label="Awaiting Moderation"
              count={statusCounts.pending_moderation}
              color="blue"
              active={statusFilter === "pending_moderation"}
              onClick={() => setStatusFilter("pending_moderation")}
            />
            <StatusCard
              label="Under Review"
              count={statusCounts.under_review}
              color="yellow"
              active={statusFilter === "under_review"}
              onClick={() => setStatusFilter("under_review")}
            />
            <StatusCard
              label="Flagged"
              count={statusCounts.flagged}
              color="red"
              active={statusFilter === "flagged"}
              onClick={() => setStatusFilter("flagged")}
            />
          </div>

          {/* Type Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{typeCounts.broker_review}</p>
              <p className="text-sm text-gray-600">Broker Reviews</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{typeCounts.property_review}</p>
              <p className="text-sm text-gray-600">Property Reviews</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{typeCounts.transaction_review}</p>
              <p className="text-sm text-gray-600">Transaction Reviews</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="broker_review">Broker Reviews</option>
              <option value="property_review">Property Reviews</option>
              <option value="transaction_review">Transaction Reviews</option>
            </select>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredReviews.length} Review{filteredReviews.length !== 1 ? 's' : ''} Pending Moderation
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredReviews.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No pending reviews found.</p>
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

function StatusCard({ 
  label, 
  count, 
  color, 
  active, 
  onClick 
}: { 
  label: string; 
  count: number; 
  color: string; 
  active: boolean; 
  onClick: () => void; 
}) {
  const colorClasses = {
    gray: active ? "bg-gray-100 border-gray-300" : "bg-white border-gray-200 hover:bg-gray-50",
    blue: active ? "bg-blue-100 border-blue-300" : "bg-white border-gray-200 hover:bg-blue-50",
    yellow: active ? "bg-yellow-100 border-yellow-300" : "bg-white border-gray-200 hover:bg-yellow-50",
    red: active ? "bg-red-100 border-red-300" : "bg-white border-gray-200 hover:bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border text-center transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </button>
  );
}

function ReviewRow({ review }: { review: PendingReview }) {
  const statusColors = {
    pending_moderation: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    flagged: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    pending_moderation: "PENDING MODERATION",
    under_review: "UNDER REVIEW",
    flagged: "FLAGGED"
  };

  const typeLabels = {
    broker_review: "Broker Review",
    property_review: "Property Review",
    transaction_review: "Transaction Review"
  };

  const typeIcons = {
    broker_review: "👤",
    property_review: "🏠",
    transaction_review: "💰"
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

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const handleReviewAction = (action: string) => {
    console.log(`${action} review ${review.id}`);
    alert(`${action} review: ${review.title}`);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{typeIcons[review.type]}</span>
            <h4 className="text-lg font-semibold text-gray-900 truncate">
              {review.title}
            </h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[review.status]}`}>
              {statusLabels[review.status]}
            </span>
          </div>
          
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <span>{typeLabels[review.type]}</span>
            <span>⭐ {renderStars(review.rating)} ({review.rating}/5)</span>
            <span>📧 {review.reviewer.email} ({review.reviewer.type})</span>
            <span>📅 {formatDate(review.submittedAt)}</span>
            {review.photos && <span>📸 {review.photos} photos</span>}
          </div>

          <div className="mt-2">
            <p className="text-sm font-medium text-gray-900">Target: {review.target.name}</p>
          </div>

          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
            <p className="text-sm text-gray-800">
              {review.content}
            </p>
          </div>

          {review.flags && review.flags.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {review.flags.map((flag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    🚩 {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {review.moderationNotes && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">📝 Moderation Notes:</span> {review.moderationNotes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {review.status === 'pending_moderation' && (
            <>
              <button
                onClick={() => handleReviewAction("Approve")}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleReviewAction("Flag for Review")}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700"
              >
                🚩 Flag
              </button>
              <button
                onClick={() => handleReviewAction("Reject")}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
              >
                ❌ Reject
              </button>
            </>
          )}
          {review.status === 'under_review' && (
            <>
              <button
                onClick={() => handleReviewAction("Approve")}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleReviewAction("Reject")}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
              >
                ❌ Reject
              </button>
            </>
          )}
          {review.status === 'flagged' && (
            <>
              <button
                onClick={() => handleReviewAction("Investigate")}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
              >
                🔍 Investigate
              </button>
              <button
                onClick={() => handleReviewAction("Ban User")}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
              >
                🚫 Ban User
              </button>
            </>
          )}
          <Link
            href={`/reviews/${review.id}`}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}