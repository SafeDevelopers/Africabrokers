"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, MapPin, RefreshCw } from "lucide-react";

type ListingAvailability = "active" | "pending_review" | "suspended" | "closed";

interface BrokerListing {
  id: string;
  priceAmount: number;
  priceCurrency: string;
  availabilityStatus: ListingAvailability;
  featured: boolean;
  property: {
    id: string;
    type: string;
    address: {
      street?: string;
      city?: string;
      country?: string;
    };
  };
  publishedAt: string | null;
}

interface ListingsResponse {
  listings: BrokerListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const STATUS_LABEL: Record<ListingAvailability, string> = {
  active: "Active",
  pending_review: "Pending Review",
  suspended: "Suspended",
  closed: "Closed",
};

export default function BrokerListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ListingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page = Number(searchParams?.get("page") ?? 1);
  const availability = (searchParams?.get("status") as ListingAvailability) ?? "active";

  const getCookie = (name: string) => {
    if (typeof document === "undefined") {
      return null;
    }
    const match = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (availability) {
        params.set("availability", availability);
      }

      const apiBase =
        process.env.NEXT_PUBLIC_CORE_API_BASE_URL ??
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const tenantHeader = getCookie("afribrok-tenant") || "et-addis";
      const token = getCookie("afribrok-token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Tenant": tenantHeader,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBase}/v1/listings/search?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load listings (${response.status})`);
      }

      const payload = (await response.json()) as ListingsResponse;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, availability]);

  const listings = useMemo(() => data?.listings ?? [], [data]);

  const handleStatusChange = (value: ListingAvailability) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("status", value);
    params.delete("page");
    router.replace(`/broker/listings?${params.toString()}`);
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", nextPage.toString());
    router.replace(`/broker/listings?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your property listings and track their performance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchListings}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/broker/listings/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Create Listing
          </Link>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Status:
        </div>
        <div className="flex flex-wrap gap-2">
          {(["active", "pending_review", "suspended", "closed"] as ListingAvailability[]).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  availability === status
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {STATUS_LABEL[status]}
              </button>
            ),
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchListings}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <p className="text-sm text-slate-600">No listings found for this status.</p>
            <Link
              href="/broker/listings/new"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {listings.map((listing) => {
              const address = listing.property.address;
              const location = [address.street, address.city, address.country]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={listing.id}
                  className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                        {listing.property.type}
                      </span>
                      {listing.featured && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          listing.availabilityStatus === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : listing.availabilityStatus === "pending_review"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {STATUS_LABEL[listing.availabilityStatus]}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {listing.property.address.street ?? "Untitled Listing"}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {location || "Location not specified"}
                    </p>
                    <p className="mt-4 text-sm font-medium text-slate-900">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: listing.priceCurrency,
                        maximumFractionDigits: 0,
                      }).format(Number(listing.priceAmount))}
                    </p>
                    {listing.publishedAt && (
                      <p className="mt-2 text-xs text-slate-500">
                        Published {new Date(listing.publishedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-stretch justify-end gap-3 lg:w-48">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      View public page
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Manage listing
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            Showing {data.pagination.limit * (data.pagination.page - 1) + listings.length} of {" "}
            {data.pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {data.pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
