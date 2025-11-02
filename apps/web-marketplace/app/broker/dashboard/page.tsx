"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "../../context/auth-context";
import {
  brokers,
  listings,
  getListingsByBroker,
  getBrokerById
} from "../../data/mock-data";
import { ListingImage } from "../../components/listing-image";

const defaultBrokerId = "broker-1";

export default function BrokerDashboardPage() {
  const { user } = useAuth();
  if (!user || (user.role !== "broker" && user.role !== "real-estate")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Broker access required</h1>
          <p className="mt-3 text-sm text-slate-600">
            Sign in with an approved AfriBrok broker or agency account to view this dashboard.
          </p>
          <Link href="/auth/login" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (user.status !== "approved") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Awaiting verification</h1>
          <p className="mt-3 text-sm text-slate-600">
            Once your documents are approved, you&apos;ll receive your QR code and access to the full broker toolkit.
          </p>
          <Link href="/broker/pending" className="mt-4 inline-flex rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10">
            Review application status
          </Link>
        </div>
      </div>
    );
  }

  const brokerId = user.role === "real-estate" ? "broker-2" : defaultBrokerId;
  const broker = getBrokerById(brokerId);
  const brokerListings = useMemo(() => getListingsByBroker(brokerId), [brokerId]);

  if (!broker) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Broker profile not found</h1>
          <p className="mt-3 text-sm text-slate-600">
            The broker dashboard is currently showing a mock profile. Once your account is connected to an
            AfriBrok brokerage, you&apos;ll see your listings and analytics here.
          </p>
          <Link
            href="/broker/apply"
            className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Apply as a broker
          </Link>
        </div>
      </div>
    );
  }

  const publishedListings = brokerListings.length;
  const pendingListings = listings.filter(
    (listing) => listing.brokerId === brokerId && listing.status !== "Verified"
  ).length;

  return (
    <div className="bg-slate-50 pb-20">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm text-primary">Broker dashboard</p>
            <h1 className="text-4xl font-bold text-slate-900">{broker.name}</h1>
            <p className="text-sm text-slate-600">
              Manage your property portfolio, track verification status, and coordinate with AfriBrok leads in
              Addis Ababa. Mock statistics demonstrate what you&apos;ll see once real data is connected.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/broker/properties/new"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                + Add new listing
              </Link>
              <Link
                href="/broker/analytics"
                className="inline-flex items-center rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                View analytics
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Verification snapshot
            </p>
            <p className="text-sm text-primary/90">
              License #{broker.licenseNumber} · {broker.verified ? "Verified" : "Pending review"}
            </p>
            <p className="text-sm text-primary/90">
              Avg response time: <span className="font-semibold">{broker.stats.responseTime}</span>
            </p>
            <Link href="/verify" className="text-xs font-semibold text-primary">
              Preview QR verification →
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-screen-2xl flex-col gap-10 px-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            At a glance
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <StatCard label="Published listings" value={String(publishedListings)} helper="+2 this month" />
            <StatCard label="Pending verification" value={String(pendingListings)} helper="1 awaiting review" />
            <StatCard label="New inquiries" value="12" helper="Last 7 days" />
            <StatCard label="Active clients" value="8" helper="Across rentals & sales" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent listings</h2>
              <Link href="/listings" className="text-sm font-medium text-primary hover:underline">
                View marketplace →
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {brokerListings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
                  No listings yet. Publish your first property via the “Add new listing” button.
                </div>
              ) : (
                brokerListings.map((listing) => (
                  <article
                    key={listing.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:flex-row md:items-center md:gap-6"
                  >
                    <div className="md:w-40">
                      <ListingImage listing={listing} className="rounded-lg" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{listing.title}</h3>
                          <p className="text-xs text-slate-500">📍 {listing.location}</p>
                          <p className="text-xs text-slate-500">{listing.propertyType} · {listing.overallRating.toFixed(1)} ★</p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            listing.status === "Verified"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {listing.status === "Verified" ? "Published" : "Awaiting verification"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                        <span>Price: {listing.priceLabel}</span>
                        <span>Bathrooms: {listing.bathrooms}</span>
                        <span>Area: {listing.area}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-primary">
                        <Link href={`/listings/${listing.id}`} className="font-semibold hover:underline">
                          View listing →
                        </Link>
                        <Link href="#" className="hover:underline">
                          Edit details
                        </Link>
                        <Link href="#" className="hover:underline">
                          Share QR
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pipeline highlights</h2>
              <p className="text-sm text-slate-600">Snapshot of recent inquiry activity.</p>
            </div>
            <ul className="space-y-4 text-sm text-slate-700">
              <li className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">3 new viewing requests</p>
                <p className="text-xs text-slate-500">Within the past 48 hours</p>
              </li>
              <li className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">92% response rate</p>
                <p className="text-xs text-slate-500">Maintain responses under 4 hours</p>
              </li>
              <li className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">Upcoming tours</p>
                <p className="text-xs text-slate-500">Bole apartment (Feb 15) · Retail space (Feb 17)</p>
              </li>
            </ul>

            <div className="rounded-xl bg-primary/10 p-4 text-xs text-primary">
              ✅ Tip: Publish fresh photos and highlight amenities weekly to improve visibility on the
              marketplace.
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Verification checklist</h2>
            <Link href="/verify" className="text-sm font-medium text-primary hover:underline">
              Preview tenant view →
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <ChecklistItem
              title="License uploaded"
              helper="ET-REA-00891 · Expires 2025"
              status="Completed"
            />
            <ChecklistItem
              title="Code of conduct"
              helper="Signed on Jan 12, 2024"
              status="Completed"
            />
            <ChecklistItem
              title="Office inspection"
              helper="Schedule follow-up visit"
              status="Pending"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function ChecklistItem({
  title,
  helper,
  status
}: {
  title: string;
  helper: string;
  status: "Completed" | "Pending";
}) {
  const statusStyles =
    status === "Completed"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
      <span
        className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}
      >
        {status}
      </span>
    </div>
  );
}
