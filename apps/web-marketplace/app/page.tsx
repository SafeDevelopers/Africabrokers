"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ListingImage } from "./components/listing-image";
import {
  brokerStats,
  listings,
  getBrokerById,
  type Listing
} from "./data/mock-data";

export default function MarketplaceLanding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredSort, setFeaturedSort] = useState<"recommended" | "price-asc" | "price-desc" | "rating-desc">("recommended");

  const featuredListings = useMemo(() => {
    const slice = listings.slice(0, 4);
    switch (featuredSort) {
      case "price-asc":
        return [...slice].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...slice].sort((a, b) => b.price - a.price);
      case "rating-desc":
        return [...slice].sort((a, b) => b.overallRating - a.overallRating);
      default:
        return slice;
    }
  }, [featuredSort]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-20">
        <div className="relative mx-auto max-w-5xl space-y-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-primary shadow-lg ring-1 ring-primary/10 transition-all hover:shadow-xl hover:ring-primary/20">
            <span className="text-base">🇪🇹</span>
            AfriBrok Ethiopia — Addis Ababa
          </span>
          <h1 className="text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
            Verified properties. <br />
            <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Trusted brokers.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
            Explore licensed listings and confirm broker status instantly. Connect with certified
            professionals for reliable property transactions.
          </p>
          
          {/* Search Bar */}
          <div className="mx-auto max-w-xl">
            <div className="group flex rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-gray-200/50 transition-all hover:shadow-2xl hover:ring-primary/20">
              <input
                type="text"
                placeholder="Search properties in Addis Ababa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
              />
              <button className="rounded-lg bg-gradient-to-r from-primary to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-primary/90 hover:to-indigo-600/90 active:scale-95">
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/broker/apply"
              className="group rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-primary/90 hover:to-indigo-600/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Become a Certified Broker
            </Link>
            <Link
              href="/verify"
              className="rounded-xl border-2 border-gray-200 bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:border-primary/30 hover:bg-gray-50 hover:shadow-lg active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Verify Broker QR 📱
            </Link>
            <Link
              href="https://example.com/broker-course"
              className="rounded-xl border-2 border-primary/30 bg-white px-8 py-3.5 text-sm font-semibold text-primary transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Broker Certification Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-white to-slate-50/50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-4">
            {brokerStats.map((stat, index) => (
              <div key={index} className="group text-center transition-transform hover:scale-105">
                <p className="text-4xl font-bold text-primary transition-colors group-hover:text-indigo-600">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-slate-50/50 px-6 py-20">
        <div className="mx-auto max-w-screen-2xl space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Featured Properties</h2>
              <p className="mt-2 text-sm text-gray-600">Curated selections for you</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium text-gray-600">Sort</label>
              <select
                value={featuredSort}
                onChange={(e) => setFeaturedSort(e.target.value as any)}
                className="rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition-all hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating-desc">Top rated</option>
              </select>
              <Link href="/listings" className="group text-sm font-semibold text-primary transition-all hover:text-indigo-600">
                View all listings <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredListings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PropertyCard({ listing }: { listing: Listing }) {
  const isVerified = listing.status === "Verified";
  const broker = getBrokerById(listing.brokerId);

  return (
    <Link href={`/listings/${listing.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1">
        <ListingImage
          listing={listing}
          overlay={
            <>
              <span className="rounded-full bg-gradient-to-r from-primary to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg ring-2 ring-white/50">
                {listing.propertyType}
              </span>
              <span className="rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md ring-2 ring-white/50">
                {listing.overallRating.toFixed(1)} ★
              </span>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-primary">{listing.title}</h3>
              <p className="mt-1 text-sm text-gray-600">📍 {listing.location}</p>
              <p className="mt-0.5 text-xs font-medium text-primary">{listing.propertyType}</p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                isVerified 
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                  : "bg-amber-50 text-amber-700 ring-amber-600/20"
              }`}
            >
              {isVerified ? "✓ Verified" : "⏳ Pending"}
            </span>
          </div>

          <div>
            <p className="text-2xl font-bold text-primary">{listing.priceLabel}</p>
            <p className="text-xs text-gray-500">per month</p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            {typeof listing.bedrooms === "number" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-gray-700">
                🛏️ {listing.bedrooms} bed
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-gray-700">
              🚿 {listing.bathrooms} bath
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-gray-700">
              📐 {listing.area}
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Broker:</span> <span className="text-gray-900">{broker ? broker.name : "Unknown"}</span>
            </div>
            <button className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white">
              Contact
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
