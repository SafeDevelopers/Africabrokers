"use client";

import Link from "next/link";
import { Empty } from "../components/ui/Empty";
import { useState, useEffect } from "react";

interface Listing {
  id: string;
  property: {
    id: string;
    type: 'residential' | 'commercial' | 'land';
    address: {
      street: string;
      subcity: string;
      city: string;
    };
  };
  broker: {
    id: string;
    licenseDocs: {
      businessName: string;
    };
    status: string;
  };
  title: string;
  priceAmount: number;
  currency: string;
  listingType: 'sale' | 'rent' | 'lease';
  status: 'draft' | 'active' | 'pending' | 'suspended' | 'sold';
  featuredUntil?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  inquiryCount: number;
}

const mockListings: Listing[] = [
  {
    id: "listing-1",
    property: {
      id: "prop-1",
      type: "residential",
      address: {
        street: "Bole Road",
        subcity: "Bole",
        city: "Addis Ababa"
      }
    },
    broker: {
      id: "broker-1",
      licenseDocs: { businessName: "Tadesse Real Estate" },
      status: "approved"
    },
    title: "Modern 3BR Apartment in Bole",
    priceAmount: 25000,
    currency: "ETB",
    listingType: "rent",
    status: "active",
    featuredUntil: "2024-11-20T00:00:00Z",
    createdAt: "2024-10-15T10:30:00Z",
    updatedAt: "2024-10-20T14:20:00Z",
    viewCount: 234,
    inquiryCount: 12
  },
  {
    id: "listing-2",
    property: {
      id: "prop-2",
      type: "commercial",
      address: {
        street: "Kazanchis Business District",
        subcity: "Arada",
        city: "Addis Ababa"
      }
    },
    broker: {
      id: "broker-2",
      licenseDocs: { businessName: "Prime Properties Ltd" },
      status: "approved"
    },
    title: "Premium Office Space - Kazanchis",
    priceAmount: 5200000,
    currency: "ETB",
    listingType: "sale",
    status: "pending",
    createdAt: "2024-10-18T09:15:00Z",
    updatedAt: "2024-10-19T16:45:00Z",
    viewCount: 89,
    inquiryCount: 5
  },
  {
    id: "listing-3",
    property: {
      id: "prop-3",
      type: "residential",
      address: {
        street: "Old Airport Area",
        subcity: "Bole",
        city: "Addis Ababa"
      }
    },
    broker: {
      id: "broker-3",
      licenseDocs: { businessName: "Elite Homes" },
      status: "approved"
    },
    title: "Luxury Villa with Garden",
    priceAmount: 45000,
    currency: "ETB",
    listingType: "rent",
    status: "active",
    createdAt: "2024-10-12T14:00:00Z",
    updatedAt: "2024-10-20T08:30:00Z",
    viewCount: 156,
    inquiryCount: 8
  },
  {
    id: "listing-4",
    property: {
      id: "prop-4",
      type: "land",
      address: {
        street: "Lebu Development Area",
        subcity: "Kolfe Keranio",
        city: "Addis Ababa"
      }
    },
    broker: {
      id: "broker-4",
      licenseDocs: { businessName: "Land Masters" },
      status: "approved"
    },
    title: "Prime Development Land - 2000sqm",
    priceAmount: 15000000,
    currency: "ETB",
    listingType: "sale",
    status: "suspended",
    createdAt: "2024-09-25T11:20:00Z",
    updatedAt: "2024-10-10T13:15:00Z",
    viewCount: 67,
    inquiryCount: 3
  }
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [listingTypeFilter, setListingTypeFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setListings(mockListings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.broker.licenseDocs.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.property.address.subcity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    const matchesType = typeFilter === "all" || listing.property.type === typeFilter;
    const matchesListingType = listingTypeFilter === "all" || listing.listingType === listingTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesListingType;
  });

  const statusCounts = {
    all: listings.length,
    draft: listings.filter(l => l.status === 'draft').length,
    active: listings.filter(l => l.status === 'active').length,
    pending: listings.filter(l => l.status === 'pending').length,
    suspended: listings.filter(l => l.status === 'suspended').length,
    sold: listings.filter(l => l.status === 'sold').length,
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
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Listings</h1>
              <p className="text-sm text-gray-500">
                Manage all property listings across the platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/listings/pending"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
              >
                Review Pending ({statusCounts.pending})
              </Link>
              <Link
                href="/listings/featured"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                Manage Featured
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid gap-4 md:grid-cols-6">
            <StatusCard
              label="Total"
              count={statusCounts.all}
              color="gray"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <StatusCard
              label="Active"
              count={statusCounts.active}
              color="green"
              active={statusFilter === "active"}
              onClick={() => setStatusFilter("active")}
            />
            <StatusCard
              label="Pending"
              count={statusCounts.pending}
              color="orange"
              active={statusFilter === "pending"}
              onClick={() => setStatusFilter("pending")}
            />
            <StatusCard
              label="Draft"
              count={statusCounts.draft}
              color="gray"
              active={statusFilter === "draft"}
              onClick={() => setStatusFilter("draft")}
            />
            <StatusCard
              label="Suspended"
              count={statusCounts.suspended}
              color="red"
              active={statusFilter === "suspended"}
              onClick={() => setStatusFilter("suspended")}
            />
            <StatusCard
              label="Sold"
              count={statusCounts.sold}
              color="blue"
              active={statusFilter === "sold"}
              onClick={() => setStatusFilter("sold")}
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search listings by title, broker, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                </select>
                <select
                  value={listingTypeFilter}
                  onChange={(e) => setListingTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Sale & Rent</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                  <option value="lease">For Lease</option>
                </select>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setListingTypeFilter("all");
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredListings.length === 0 ? (
              <Empty title="No listings found" description="Try adjusting your filters or search terms." />
            ) : (
              filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
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
    green: active ? "bg-green-100 border-green-300" : "bg-white border-gray-200 hover:bg-green-50",
    orange: active ? "bg-orange-100 border-orange-300" : "bg-white border-gray-200 hover:bg-orange-50",
    red: active ? "bg-red-100 border-red-300" : "bg-white border-gray-200 hover:bg-red-50",
    blue: active ? "bg-blue-100 border-blue-300" : "bg-white border-gray-200 hover:bg-blue-50",
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

function ListingCard({ listing }: { listing: Listing }) {
  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    pending: "bg-orange-100 text-orange-800",
    suspended: "bg-red-100 text-red-800",
    sold: "bg-blue-100 text-blue-800"
  };

  const propertyTypeIcons = {
    residential: "🏠",
    commercial: "🏢",
    land: "🏞️"
  };

  const formatPrice = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isFeatured = listing.featuredUntil && new Date(listing.featuredUntil) > new Date();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{propertyTypeIcons[listing.property.type]}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{listing.title}</h3>
            <p className="text-sm text-gray-600">
              📍 {listing.property.address.subcity}, {listing.property.address.city}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[listing.status]}`}>
            {listing.status.toUpperCase()}
          </span>
          {isFeatured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              ⭐ FEATURED
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-indigo-600">
            {formatPrice(listing.priceAmount, listing.currency)}
            {listing.listingType === 'rent' && <span className="text-sm text-gray-500"> / month</span>}
          </p>
          <span className="text-sm text-gray-500 uppercase font-medium">
            For {listing.listingType}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>🏢 {listing.broker.licenseDocs.businessName}</span>
          <span>📅 {formatDate(listing.createdAt)}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>👁️ {listing.viewCount} views</span>
          <span>💬 {listing.inquiryCount} inquiries</span>
          <span>🏷️ {listing.property.type}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex space-x-2">
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Edit
            </button>
            <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
              {listing.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
            {!isFeatured && (
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Feature
              </button>
            )}
          </div>
          <Link
            href={`/listings/${listing.id}`}
            className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}