"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface ReportedListing {
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
  reportedAt: string;
  reportedBy: {
    id: string;
    email: string;
    type: 'user' | 'broker' | 'anonymous';
  };
  reportReason: string;
  reportDetails: string;
  status: 'new' | 'under_investigation' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolutionNotes?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const mockReportedListings: ReportedListing[] = [
  {
    id: "listing-r1",
    title: "Apartment with Misleading Photos",
    address: "Kirkos Sub City, Addis Ababa",
    price: 320000,
    currency: "ETB",
    listingType: "sale",
    propertyType: "apartment",
    broker: {
      id: "broker-bad1",
      businessName: "Questionable Properties",
      email: "suspect@example.com"
    },
    reportedAt: "2024-01-22T16:30:00Z",
    reportedBy: {
      id: "user-123",
      email: "concerned.buyer@gmail.com",
      type: "user"
    },
    reportReason: "Misleading Information",
    reportDetails: "Photos show different property than what was visited. Interior looks completely different and much smaller.",
    status: "new",
    severity: "high"
  },
  {
    id: "listing-r2",
    title: "Overpriced Commercial Space",
    address: "Yeka Sub City, Addis Ababa", 
    price: 150000,
    currency: "ETB",
    listingType: "rent",
    propertyType: "commercial",
    broker: {
      id: "broker-bad2",
      businessName: "Premium Spaces Ltd",
      email: "overpriced@spaces.et"
    },
    reportedAt: "2024-01-21T11:15:00Z",
    reportedBy: {
      id: "broker-competitor",
      email: "competing.broker@realty.et",
      type: "broker"
    },
    reportReason: "Price Manipulation",
    reportDetails: "This property is listed at 3x the market rate for similar properties in the area. Appears to be price manipulation.",
    status: "under_investigation",
    assignedTo: "admin@afribrok.et",
    severity: "medium"
  },
  {
    id: "listing-r3",
    title: "Fake Property Listing",
    address: "Arada Sub City, Addis Ababa",
    price: 850000,
    currency: "ETB",
    listingType: "sale",
    propertyType: "house",
    broker: {
      id: "broker-bad3",
      businessName: "Fast Houses",
      email: "fast@houses.et"
    },
    reportedAt: "2024-01-20T09:45:00Z",
    reportedBy: {
      id: "anonymous",
      email: "anonymous",
      type: "anonymous"
    },
    reportReason: "Fraudulent Listing",
    reportDetails: "This property doesn't exist at the given address. Photos are stolen from another listing website.",
    status: "resolved",
    assignedTo: "admin@afribrok.et",
    resolutionNotes: "Listing removed and broker account suspended. Photos confirmed to be stolen from international listing site.",
    severity: "critical"
  },
  {
    id: "listing-r4",
    title: "Inappropriate Content in Description",
    address: "Nifas Silk Sub City, Addis Ababa",
    price: 45000,
    currency: "ETB",
    listingType: "rent",
    propertyType: "apartment",
    broker: {
      id: "broker-bad4",
      businessName: "Urban Rentals",
      email: "urban@rentals.et"
    },
    reportedAt: "2024-01-19T14:20:00Z",
    reportedBy: {
      id: "user-456",
      email: "family.seeker@outlook.com",
      type: "user"
    },
    reportReason: "Inappropriate Content",
    reportDetails: "Listing contains discriminatory language about tenant preferences that violates fair housing policies.",
    status: "dismissed",
    assignedTo: "admin@afribrok.et",
    resolutionNotes: "Reviewed listing description - no discriminatory language found. Report appears to be false.",
    severity: "low"
  }
];

export default function ReportedListingsPage() {
  const [listings, setListings] = useState<ReportedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setListings(mockReportedListings);
      setLoading(false);
    }, 800);
  }, []);

  const filteredListings = listings.filter(listing => {
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || listing.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const statusCounts = {
    all: listings.length,
    new: listings.filter(l => l.status === 'new').length,
    under_investigation: listings.filter(l => l.status === 'under_investigation').length,
    resolved: listings.filter(l => l.status === 'resolved').length,
    dismissed: listings.filter(l => l.status === 'dismissed').length,
  };

  const severityCounts = {
    critical: listings.filter(l => l.severity === 'critical').length,
    high: listings.filter(l => l.severity === 'high').length,
    medium: listings.filter(l => l.severity === 'medium').length,
    low: listings.filter(l => l.severity === 'low').length,
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
              <h1 className="text-2xl font-bold text-gray-900">Reported Listings</h1>
              <p className="text-sm text-gray-500">
                Investigate and resolve user reports about problematic listings
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
          <div className="grid gap-4 md:grid-cols-5">
            <StatusCard
              label="Total Reports"
              count={statusCounts.all}
              color="gray"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <StatusCard
              label="New"
              count={statusCounts.new}
              color="red"
              active={statusFilter === "new"}
              onClick={() => setStatusFilter("new")}
            />
            <StatusCard
              label="Investigating"
              count={statusCounts.under_investigation}
              color="yellow"
              active={statusFilter === "under_investigation"}
              onClick={() => setStatusFilter("under_investigation")}
            />
            <StatusCard
              label="Resolved"
              count={statusCounts.resolved}
              color="green"
              active={statusFilter === "resolved"}
              onClick={() => setStatusFilter("resolved")}
            />
            <StatusCard
              label="Dismissed"
              count={statusCounts.dismissed}
              color="gray"
              active={statusFilter === "dismissed"}
              onClick={() => setStatusFilter("dismissed")}
            />
          </div>

          {/* Severity Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-900">{severityCounts.critical}</p>
              <p className="text-sm text-red-700">Critical</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-orange-900">{severityCounts.high}</p>
              <p className="text-sm text-orange-700">High</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-900">{severityCounts.medium}</p>
              <p className="text-sm text-yellow-700">Medium</p>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-900">{severityCounts.low}</p>
              <p className="text-sm text-green-700">Low</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Reported Listings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredListings.length} Reported Listing{filteredListings.length !== 1 ? 's' : ''}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredListings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No reported listings found.</p>
                </div>
              ) : (
                filteredListings.map((listing) => (
                  <ReportedListingRow key={listing.id} listing={listing} />
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
    red: active ? "bg-red-100 border-red-300" : "bg-white border-gray-200 hover:bg-red-50",
    yellow: active ? "bg-yellow-100 border-yellow-300" : "bg-white border-gray-200 hover:bg-yellow-50",
    green: active ? "bg-green-100 border-green-300" : "bg-white border-gray-200 hover:bg-green-50",
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

function ReportedListingRow({ listing }: { listing: ReportedListing }) {
  const statusColors = {
    new: "bg-red-100 text-red-800",
    under_investigation: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    dismissed: "bg-gray-100 text-gray-800"
  };

  const statusLabels = {
    new: "NEW",
    under_investigation: "INVESTIGATING", 
    resolved: "RESOLVED",
    dismissed: "DISMISSED"
  };

  const severityColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500"
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

  const handleReportAction = (action: string) => {
    console.log(`${action} report for listing ${listing.id}`);
    alert(`${action} report for: ${listing.title}`);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${severityColors[listing.severity]}`} title={`${listing.severity} severity`}></div>
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
          </div>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>👤 Broker: {listing.broker.businessName}</span>
            <span>📧 {listing.broker.email}</span>
          </div>

          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-red-800">🚨 Report:</span>
              <span className="text-red-700">{listing.reportReason}</span>
              <span className="text-red-600">by {listing.reportedBy.email} ({listing.reportedBy.type})</span>
              <span className="text-red-600">on {formatDate(listing.reportedAt)}</span>
            </div>
            <p className="mt-1 text-sm text-red-700">
              {listing.reportDetails}
            </p>
          </div>

          {listing.assignedTo && (
            <div className="mt-2 text-sm text-gray-600">
              👤 Assigned to: {listing.assignedTo}
            </div>
          )}

          {listing.resolutionNotes && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <span className="font-semibold">✅ Resolution:</span> {listing.resolutionNotes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {listing.status === 'new' && (
            <>
              <button
                onClick={() => handleReportAction("Start Investigation")}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700"
              >
                🔍 Investigate
              </button>
              <button
                onClick={() => handleReportAction("Dismiss")}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700"
              >
                🚫 Dismiss
              </button>
            </>
          )}
          {listing.status === 'under_investigation' && (
            <>
              <button
                onClick={() => handleReportAction("Resolve")}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
              >
                ✅ Resolve
              </button>
              <button
                onClick={() => handleReportAction("Escalate")}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
              >
                ⚠️ Escalate
              </button>
            </>
          )}
          <Link
            href={`/listings/${listing.id}`}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700"
          >
            View Listing
          </Link>
        </div>
      </div>
    </div>
  );
}