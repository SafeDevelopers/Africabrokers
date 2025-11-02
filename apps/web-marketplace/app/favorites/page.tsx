"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  userFavorites,
  getListingById,
  getBrokerById,
  type ListingPurpose
} from "../data/mock-data";
import { ListingImage } from "../components/listing-image";

type PurposeFilter = "all" | ListingPurpose;
type SortOption = "recent" | "priceLowHigh" | "priceHighLow";

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Recently added", value: "recent" },
  { label: "Lowest price", value: "priceLowHigh" },
  { label: "Highest price", value: "priceHighLow" }
];

export default function FavoritesPage() {
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const favoriteListings = useMemo(() => {
    const enriched = userFavorites
      .map((favorite) => {
        const listing = getListingById(favorite.listingId);
        const broker = listing ? getBrokerById(listing.brokerId) : null;
        if (!listing || !broker) return null;
        return { favorite, listing, broker };
      })
      .filter(Boolean) as Array<{
      favorite: (typeof userFavorites)[number];
      listing: NonNullable<ReturnType<typeof getListingById>>;
      broker: NonNullable<ReturnType<typeof getBrokerById>>;
    }>;

    const filtered =
      purpose === "all"
        ? enriched
        : enriched.filter((entry) => entry.listing.purpose === purpose);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "priceLowHigh":
          return a.listing.price - b.listing.price;
        case "priceHighLow":
          return b.listing.price - a.listing.price;
        default:
          return (
            new Date(b.favorite.addedAt).getTime() -
            new Date(a.favorite.addedAt).getTime()
          );
      }
    });
  }, [purpose, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-6 py-10">
          <div>
            <p className="text-sm text-slate-500">Favorites</p>
            <h1 className="text-3xl font-bold text-slate-900">Saved properties</h1>
            <p className="text-sm text-slate-600">
              Compare homes and spaces you&apos;ve pinned from verified brokers. Organize by purpose,
              price, or the day you saved them.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-screen-2xl px-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="All"
              active={purpose === "all"}
              onClick={() => setPurpose("all")}
            />
            <FilterChip
              label="Rentals"
              active={purpose === "Rent"}
              onClick={() => setPurpose("Rent")}
            />
            <FilterChip
              label="For sale"
              active={purpose === "Sale"}
              onClick={() => setPurpose("Sale")}
            />
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
            <label htmlFor="sortBy" className="text-xs uppercase tracking-wide text-slate-500">
              Sort
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoriteListings.map(({ favorite, listing, broker }) => (
            <article
              key={favorite.id}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <ListingImage listing={listing} overlay={
                <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700">
                  Saved {favorite.addedAt}
                </span>
              } />

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{listing.title}</h2>
                  <p className="text-sm text-slate-600">📍 {listing.location}</p>
                </div>
                <p className="text-sm font-semibold text-primary">{listing.priceLabel}</p>
                {favorite.notes ? (
                  <p className="text-sm text-slate-600">{favorite.notes}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    No notes yet — add visit reminders or decision timelines.
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-xs text-primary">
                  <Link href={`/listings/${listing.id}`} className="font-semibold hover:underline">
                    View details →
                  </Link>
                  <Link href={`/brokers/${broker.id}`} className="hover:underline">
                    Message {broker.name}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {favoriteListings.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            Start exploring verified listings to populate this list. Your saved properties will appear
            here for quick access.
          </div>
        ) : null}
      </main>
    </div>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
