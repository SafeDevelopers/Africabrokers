"use client";

import Link from "next/link";
import { useAuth } from "../context/auth-context";
import {
  currentUser,
  userMetrics,
  userFavorites,
  userInquiries,
  getListingById,
  getBrokerById,
  type Listing
} from "../data/mock-data";
import { ListingImage } from "../components/listing-image";

const statusClasses: Record<string, string> = {
  "Meeting Scheduled": "bg-emerald-100 text-emerald-700",
  "Broker Responded": "bg-blue-100 text-blue-700",
  "Awaiting Broker": "bg-amber-100 text-amber-700",
  Closed: "bg-slate-200 text-slate-700"
};

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in to view your dashboard</h1>
          <p className="mt-3 text-sm text-slate-600">
            Your inquiries, favorites, and visit schedules are only available when you&apos;re logged in.
            Please sign in or create a new AfriBrok account to continue.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/login"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const favoriteListings = userFavorites
    .map((favorite) => {
      const listing = getListingById(favorite.listingId);
      return listing ? { favorite, listing } : null;
    })
    .filter(
      (entry): entry is { favorite: (typeof userFavorites)[number]; listing: Listing } =>
        entry !== null
    );

  const activeInquiries = userInquiries.slice(0, 3);
  const profileName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Welcome back 👋</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Hi {profileName}, here&apos;s your week
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Track saved properties, manage broker conversations, and prepare for on-site visits in Addis
              Ababa. Upgrade to Pro for shared workspaces with your team.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-100/60 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
              {currentUser.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-600">
                {currentUser.plan} plan · Joined {currentUser.joinedAt}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-screen-2xl flex-col gap-10 px-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Snapshot
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {userMetrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs uppercase text-slate-500">{metric.label}</p>
                <div className="mt-2 flex items-end gap-2">
                  <p className="text-3xl font-semibold text-slate-900">{metric.value}</p>
                  <span
                    className={`text-xs font-medium ${
                      metric.trend === "up"
                        ? "text-emerald-600"
                        : metric.trend === "down"
                        ? "text-rose-600"
                        : "text-slate-500"
                    }`}
                  >
                    {metric.helper}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent inquiries</h2>
              <Link href="/inquiries" className="text-sm font-medium text-primary hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-4">
              {activeInquiries.map((inquiry) => {
                const listing = getListingById(inquiry.listingId);
                const broker = getBrokerById(inquiry.brokerId);
                if (!listing || !broker) return null;

                return (
                  <article
                    key={inquiry.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:gap-6"
                  >
                    <div className="md:w-48">
                      <ListingImage listing={listing} className="rounded-lg" />
                    </div>

                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{listing.title}</h3>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {broker.name} · {inquiry.preferredContact} preferred
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            statusClasses[inquiry.status] ?? "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{inquiry.message}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Submitted {inquiry.submittedAt}</span>
                        <span className="hidden md:block">•</span>
                        <span>Updated {inquiry.lastUpdated}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upcoming visits</h2>
              <p className="text-sm text-slate-600">
                Prepare documents before you meet brokers in person.
              </p>
            </div>

            <ul className="space-y-4 text-sm text-slate-700">
              <li>
                <p className="font-semibold text-slate-900">Modern 3BR Apartment in Bole</p>
                <p className="text-xs text-slate-500">Viewing with Desta Real Estate · Feb 15 · 5:30 PM</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">Boutique Retail Space on Bole Road</p>
                <p className="text-xs text-slate-500">
                  Walkthrough with Prime Properties · Feb 17 · 11:00 AM
                </p>
              </li>
            </ul>

            <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
              ✅ Don&apos;t forget to bring your ID and proof of funds for verification on arrival.
            </div>
          </aside>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your saved properties</h2>
            <Link href="/favorites" className="text-sm font-medium text-primary hover:underline">
              Manage favorites →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {favoriteListings.slice(0, 3).map(({ favorite, listing }) => (
              <article
                key={favorite.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <ListingImage listing={listing} />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{listing.title}</h3>
                    <p className="text-xs text-slate-500">Added on {favorite.addedAt}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{listing.priceLabel}</p>
                  {favorite.notes ? (
                    <p className="text-sm text-slate-600">{favorite.notes}</p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between text-xs text-primary">
                    <Link href={`/listings/${listing.id}`} className="font-semibold hover:underline">
                      View listing →
                    </Link>
                    <Link href={`/brokers/${listing.brokerId}`} className="hover:underline">
                      Message broker
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
