"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface PendingListing {
  id: string;
  title: string;
  address: string;
  price: number;
  currency: string;
  listingType: 'sale' | 'rent';
  propertyType: 'apartment' | 'house' | 'commercial' | 'land';
  broker: {
    id: string;
    businessName: string;
    email: string;
  };
  submittedAt: string;
  status: 'pending_review' | 'under_review' | 'changes_requested';
  reviewNotes?: string;
  images: number;
  description: string;
}

const mockPendingListings: PendingListing[] = [
  {
    id: "listing-p1",
    title: "Modern 2BR Apartment in Bole",
    address: "Bole Sub City, Addis Ababa",
    price: 450000,
    currency: "ETB",
    listingType: "sale",
    propertyType: "apartment",
    broker: {
      id: "broker-1",
      businessName: "Tadesse Real Estate",
      email: "alemayehu@example.com"
    },
    submittedAt: "2024-01-22T14:30:00Z",
    status: "pending_review",
    images: 8,
    description: "Beautiful modern apartment with city views..."
  },
  {
    id: "listing-p2", 
    title: "Commercial Office Space - Kazanchis",
    address: "Kazanchis, Addis Ababa",
    price: 25000,
    currency: "ETB",
    listingType: "rent",
    propertyType: "commercial",
    broker: {
      id: "broker-2",
      businessName: "Prime Properties Ltd",
      email: "sara.m@primeprops.et"
    },
    submittedAt: "2024-01-22T10:15:00Z",
    status: "under_review",
    images: 12,
    description: "Prime commercial space perfect for offices..."
  },
  {
    id: "listing-p3",
    title: "Family Villa in Ayat",
    address: "Ayat Real Estate, Addis Ababa",
    price: 850000,
    currency: "ETB", 
    listingType: "sale",
    propertyType: "house",
    broker: {
      id: "broker-3",
      businessName: "Elite Homes",
      email: "dawit@elitehomes.et"
    },
    submittedAt: "2024-01-21T16:45:00Z",
    status: "changes_requested",
    reviewNotes: "Please provide additional photos of the interior and update the floor plan",
    images: 5,
    description: "Spacious family villa with garden..."
  }
];

export default function PendingListingsPage() {
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setListings(mockPendingListings);
      setLoading(false);
    }, 800);
  }, []);

  const filteredListings = listings.filter(listing => {
    return statusFilter === "all" || listing.status === statusFilter;
  });

  const statusCounts = {
    all: listings.length,
    pending_review: listings.filter(l => l.status === 'pending_review').length,
    under_review: listings.filter(l => l.status === 'under_review').length,
    changes_requested: listings.filter(l => l.status === 'changes_requested').length,
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
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Pending Listings Review</h1>
              <p className="text-sm text-gray-500">
                Review and approve property listings submitted by brokers
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/listings"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to All Listings
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
              label="Total"
              count={statusCounts.all}
              color="gray"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <StatusCard
              label="Pending Review"
              count={statusCounts.pending_review}
              color="yellow"
              active={statusFilter === "pending_review"}
              onClick={() => setStatusFilter("pending_review")}
            />
            <StatusCard
              label="Under Review"
              count={statusCounts.under_review}
              color="blue"
              active={statusFilter === "under_review"}
              onClick={() => setStatusFilter("under_review")}
            />
            <StatusCard
              label="Changes Requested"
              count={statusCounts.changes_requested}
              color="red"
              active={statusFilter === "changes_requested"}
              onClick={() => setStatusFilter("changes_requested")}
            />
          </div>

          {/* Listings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredListings.length} Listing{filteredListings.length !== 1 ? 's' : ''} Pending Review
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredListings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No pending listings found.</p>
                </div>
              ) : (
                filteredListings.map((listing) => (
                  <ListingRow key={listing.id} listing={listing} />
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

function ListingRow({ listing }: { listing: PendingListing }) {
  const statusColors = {
    pending_review: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800",
    changes_requested: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    pending_review: "PENDING REVIEW",
    under_review: "UNDER REVIEW",
    changes_requested: "CHANGES REQUESTED"
  };

  const propertyTypeLabels = {
    apartment: "🏢 Apartment",
    house: "🏠 House", 
    commercial: "🏢 Commercial",
    land: "🌍 Land"
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US').format(price) + ` ${currency}`;
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

  const handleListingAction = (action: string) => {
    console.log(`${action} listing ${listing.id}`);
    alert(`${action} listing: ${listing.title}`);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-lg font-semibold text-gray-900 truncate">
              {listing.title}
            </h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[listing.status]}`}>
              {statusLabels[listing.status]}
            </span>
          </div>
          
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <span>📍 {listing.address}</span>
            <span>{propertyTypeLabels[listing.propertyType]}</span>
            <span>💰 {formatPrice(listing.price, listing.currency)} {listing.listingType === 'rent' ? '/month' : ''}</span>
            <span>📸 {listing.images} photos</span>
          </div>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>👤 {listing.broker.businessName}</span>
            <span>📧 {listing.broker.email}</span>
            <span>📅 Submitted {formatDate(listing.submittedAt)}</span>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-700 line-clamp-2">
              {listing.description}
            </p>
          </div>

          {listing.reviewNotes && (
            <div className="mt-2">
              <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                📝 Review Notes: {listing.reviewNotes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => handleListingAction("Approve")}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => handleListingAction("Request Changes")}
            className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-orange-700"
          >
            📝 Request Changes
          </button>
          <button
            onClick={() => handleListingAction("Reject")}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
          >
            ❌ Reject
          </button>
          <Link
            href={`/listings/${listing.id}`}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}