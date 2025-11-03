"use client";

import Link from "next/link";
import { useAuth } from "../../context/auth-context";
import { getListingsByBroker } from "../../data/mock-data";
import { ListingImage } from "../../components/listing-image";
import { CheckCircle2, Clock, Eye, Edit2, Trash2 } from "lucide-react";

const defaultBrokerId = "broker-1";

export default function ListingsPage() {
  const { user } = useAuth();
  const brokerId = user?.role === "real-estate" ? "broker-2" : defaultBrokerId;
  const listings = getListingsByBroker(brokerId);

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Property Listings</h1>
              <p className="mt-2 text-sm text-slate-600">
                Manage and track all your property listings
              </p>
            </div>
            <Link
              href="/broker/listings/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              + New Listing
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-8">
        {listings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-600 mb-4">You don't have any listings yet.</p>
            <Link
              href="/broker/listings/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              + Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:gap-6"
              >
                <div className="md:w-40 flex-shrink-0">
                  <ListingImage listing={listing} className="rounded-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{listing.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">📍 {listing.location}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {listing.propertyType} · {listing.purpose}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        listing.status === "Verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {listing.status === "Verified" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      {listing.status === "Verified" ? "Published" : "Pending"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="font-semibold text-primary">{listing.priceLabel}</span>
                    <span>Bedrooms: {listing.bedrooms || "N/A"}</span>
                    <span>Bathrooms: {listing.bathrooms}</span>
                    <span>Area: {listing.area}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      247 views
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

