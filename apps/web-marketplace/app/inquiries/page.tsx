"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  userInquiries,
  getListingById,
  getBrokerById,
  type InquiryStatus
} from "../data/mock-data";
import { ListingImage } from "../components/listing-image";

type StatusFilter = "all" | InquiryStatus;

const statusStyles: Record<InquiryStatus, string> = {
  "Awaiting Broker": "border-amber-200 bg-amber-50 text-amber-700",
  "Broker Responded": "border-blue-200 bg-blue-50 text-blue-700",
  "Meeting Scheduled": "border-emerald-200 bg-emerald-50 text-emerald-700",
  Closed: "border-slate-200 bg-slate-100 text-slate-700"
};

export default function InquiriesPage() {
  const [status, setStatus] = useState<StatusFilter>("all");

  const inquiries = useMemo(() => {
    const enriched = userInquiries
      .map((inquiry) => {
        const listing = getListingById(inquiry.listingId);
        const broker = inquiry.brokerId ? getBrokerById(inquiry.brokerId) : null;
        if (!listing) return null;
        return { inquiry, listing, broker };
      })
      .filter(Boolean) as Array<{
      inquiry: (typeof userInquiries)[number];
      listing: NonNullable<ReturnType<typeof getListingById>>;
      broker: ReturnType<typeof getBrokerById>;
    }>;

    if (status === "all") return enriched;
    return enriched.filter((entry) => entry.inquiry.status === status);
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-6 py-10">
          <div>
            <p className="text-sm text-slate-500">Inquiries</p>
            <h1 className="text-3xl font-bold text-slate-900">Conversations with brokers</h1>
            <p className="text-sm text-slate-600">
              Track responses, schedule viewings, and keep your property questions organized. Filter
              inquiries by their current status for a quick overview.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-screen-2xl px-6">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <StatusChip label="All" active={status === "all"} onClick={() => setStatus("all")} />
          <StatusChip
            label="Awaiting broker"
            active={status === "Awaiting Broker"}
            onClick={() => setStatus("Awaiting Broker")}
          />
          <StatusChip
            label="Broker responded"
            active={status === "Broker Responded"}
            onClick={() => setStatus("Broker Responded")}
          />
          <StatusChip
            label="Meeting scheduled"
            active={status === "Meeting Scheduled"}
            onClick={() => setStatus("Meeting Scheduled")}
          />
          <StatusChip
            label="Closed"
            active={status === "Closed"}
            onClick={() => setStatus("Closed")}
          />
        </div>

        <div className="mt-8 space-y-6">
          {inquiries.map(({ inquiry, listing, broker }) => (
            <article
              key={inquiry.id}
              className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[260px,1fr]"
            >
              <div className="space-y-3">
                <ListingImage listing={listing} className="rounded-xl" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{listing.title}</p>
                  <p className="text-xs text-slate-500">
                    Submitted {inquiry.submittedAt} · Updated {inquiry.lastUpdated}
                  </p>
                  <span
                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusStyles[inquiry.status]
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {broker ? broker.name : "Pending verification"}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Preferred contact · {inquiry.preferredContact}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-primary">
                    <Link href={`/brokers/${inquiry.brokerId}`} className="font-semibold hover:underline">
                      View broker →
                    </Link>
                    <Link href={`/listings/${listing.id}`} className="hover:underline">
                      Listing details
                    </Link>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {inquiry.message}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Next steps</p>
                    <p className="mt-2 text-sm text-slate-700">
                      {inquiry.status === "Awaiting Broker"
                        ? "Follow up if you don't hear back within 24 hours."
                        : inquiry.status === "Broker Responded"
                        ? "Coordinate viewing date and prepare any required documents."
                        : inquiry.status === "Meeting Scheduled"
                        ? "Confirm attendance the day before and plan your travel time."
                        : "Archive the conversation or leave a review for the broker."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Broker notes</p>
                    <p className="mt-2 text-sm text-slate-700">
                      {broker
                        ? `${broker.company} typically replies within ${broker.stats.responseTime}.`
                        : "This broker is pending verification. Responses may be delayed."}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {inquiries.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            No inquiries in this category yet. Reach out to a broker from a property page to get
            started.
          </div>
        ) : null}
      </main>
    </div>
  );
}

type StatusChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function StatusChip({ label, active, onClick }: StatusChipProps) {
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
