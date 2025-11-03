"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface FeaturedListing {
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
  featuredAt: string;
  featuredUntil: string;
  featuredBy: string;
  featuredReason: string;
  views: number;
  leads: number;
  images: number;
  isFeatured: boolean;
}

const mockFeaturedListings: FeaturedListing[] = [
  {
    id: "listing-f1",
    title: "Luxury Penthouse - Bole Atlas",
    address: "Bole Atlas, Addis Ababa",
    price: 1250000,
    currency: "ETB",
    listingType: "sale",
    propertyType: "apartment",
    broker: {
      id: "broker-1",
      businessName: "Tadesse Real Estate",
      email: "alemayehu@example.com"
    },
    featuredAt: "2024-01-20T08:00:00Z",
    featuredUntil: "2024-02-20T08:00:00Z",
    featuredBy: "admin@afribrok.et",
    featuredReason: "High-quality listing with excellent photos",
    views: 1547,
    leads: 23,
    images: 15,
    isFeatured: true
  },
  {
    id: "listing-f2",
    title: "Prime Office Building - Mexico",
    address: "Mexico Square, Addis Ababa", 
    price: 85000,
    currency: "ETB",
    listingType: "rent",
    propertyType: "commercial",
    broker: {
      id: "broker-2",
      businessName: "Prime Properties Ltd",
      email: "sara.m@primeprops.et"
    },
    featuredAt: "2024-01-18T10:00:00Z",
    featuredUntil: "2024-02-18T10:00:00Z",
    featuredBy: "admin@afribrok.et",
    featuredReason: "Promoted listing for premium broker",
    views: 987,
    leads: 18,
    images: 20,
    isFeatured: true
  },
  {
    id: "listing-f3",
    title: "Modern Villa - Gullele",
    address: "Gullele Sub City, Addis Ababa",
    price: 950000,
    currency: "ETB",
    listingType: "sale", 
    propertyType: "house",
    broker: {
      id: "broker-3",
      businessName: "Elite Homes",
      email: "dawit@elitehomes.et"
    },
    featuredAt: "2024-01-15T12:00:00Z",
    featuredUntil: "2024-01-25T12:00:00Z",
    featuredBy: "admin@afribrok.et",
    featuredReason: "Featured promotion expired",
    views: 756,
    leads: 12,
    images: 18,
    isFeatured: false
  }
];

export default function FeaturedListingsPage() {
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setListings(mockFeaturedListings);
      setLoading(false);
    }, 800);
  }, []);

  const filteredListings = listings.filter(listing => {
    if (statusFilter === "active") return listing.isFeatured;
    if (statusFilter === "expired") return !listing.isFeatured;
    return true;
  });

  const statusCounts = {
    all: listings.length,
    active: listings.filter(l => l.isFeatured).length,
    expired: listings.filter(l => !l.isFeatured).length,
  };

  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
  const totalLeads = listings.reduce((sum, listing) => sum + listing.leads, 0);

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
              <h1 className="text-2xl font-bold text-gray-900">Featured Properties</h1>
              <p className="text-sm text-gray-500">
                Manage promoted and featured property listings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/listings"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to All Listings
              </Link>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                onClick={() => alert("Feature new listing dialog (mock)")}
              >
                + Feature Listing
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{statusCounts.active}</p>
              <p className="text-sm text-gray-600">Active Featured</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{statusCounts.expired}</p>
              <p className="text-sm text-gray-600">Expired</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "all" ? "bg-indigo-100 text-indigo-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "active" ? "bg-green-100 text-green-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Active ({statusCounts.active})
            </button>
            <button
              onClick={() => setStatusFilter("expired")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "expired" ? "bg-red-100 text-red-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Expired ({statusCounts.expired})
            </button>
          </div>

          {/* Featured Listings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredListings.length} Featured Listing{filteredListings.length !== 1 ? 's' : ''}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredListings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No featured listings found.</p>
                </div>
              ) : (
                filteredListings.map((listing) => (
                  <FeaturedListingRow key={listing.id} listing={listing} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeaturedListingRow({ listing }: { listing: FeaturedListing }) {
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
      day: 'numeric'
    });
  };

  const isExpiringSoon = () => {
    const daysUntilExpiry = Math.ceil((new Date(listing.featuredUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const handleFeatureAction = (action: string) => {
    console.log(`${action} featured listing ${listing.id}`);
    alert(`${action} featured listing: ${listing.title}`);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-lg font-semibold text-gray-900 truncate">
              {listing.title}
            </h4>
            {listing.isFeatured ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ⭐ FEATURED
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                EXPIRED
              </span>
            )}
            {isExpiringSoon() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                EXPIRING SOON
              </span>
            )}
          </div>
          
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <span>📍 {listing.address}</span>
            <span>{propertyTypeLabels[listing.propertyType]}</span>
            <span>💰 {formatPrice(listing.price, listing.currency)} {listing.listingType === 'rent' ? '/month' : ''}</span>
            <span>📸 {listing.images} photos</span>
          </div>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>👤 {listing.broker.businessName}</span>
            <span>👀 {listing.views.toLocaleString()} views</span>
            <span>📞 {listing.leads} leads</span>
          </div>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>⭐ Featured: {formatDate(listing.featuredAt)}</span>
            <span>📅 Until: {formatDate(listing.featuredUntil)}</span>
            <span>👤 By: {listing.featuredBy}</span>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              📝 Reason: {listing.featuredReason}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {listing.isFeatured ? (
            <>
              <button
                onClick={() => handleFeatureAction("Extend")}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
              >
                📅 Extend
              </button>
              <button
                onClick={() => handleFeatureAction("Remove")}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
              >
                🚫 Remove
              </button>
            </>
          ) : (
            <button
              onClick={() => handleFeatureAction("Re-feature")}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
            >
              ⭐ Re-feature
            </button>
          )}
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