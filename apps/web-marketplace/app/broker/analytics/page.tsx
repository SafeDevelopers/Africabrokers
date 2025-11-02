"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getBrokerById, listings, userInquiries } from "../../data/mock-data";

const currentBrokerId = "broker-1";

const performanceMetrics = [
  { label: "Profile completeness", value: "92%", helper: "Add 2 more photos to reach 100%" },
  { label: "Listing quality score", value: "86", helper: "↑ +4 this month" },
  { label: "Lead conversion rate", value: "18%", helper: "Target: 20%" },
  { label: "Avg response time", value: "2h 15m", helper: "AfriBrok standard < 4h" }
] as const;

const trafficSources = [
  { source: "Marketplace search", value: 58 },
  { source: "Shared QR flyers", value: 22 },
  { source: "Direct agent referrals", value: 12 },
  { source: "Corporate relocation partners", value: 8 }
] as const;

const inquiryStatusBreakdown = [
  { label: "New", value: 7 },
  { label: "In negotiation", value: 9 },
  { label: "Awaiting documents", value: 4 },
  { label: "Closed won", value: 6 },
  { label: "Closed lost", value: 3 }
] as const;

const occupancyData = [
  { month: "Oct", percent: 68 },
  { month: "Nov", percent: 72 },
  { month: "Dec", percent: 81 },
  { month: "Jan", percent: 85 },
  { month: "Feb", percent: 88 }
] as const;

export default function BrokerAnalyticsPage() {
  const broker = getBrokerById(currentBrokerId);
  const totalInquiries = useMemo(
    () => userInquiries.filter((inquiry) => inquiry.brokerId === currentBrokerId).length,
    []
  );
  const activeListings = listings.filter(
    (listing) => listing.brokerId === currentBrokerId && listing.status === "Verified"
  ).length;

  if (!broker) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Analytics unavailable</h1>
          <p className="mt-3 text-sm text-slate-600">
            We couldn&apos;t find an analytics profile for this broker. Once your account is verified, you&apos;ll see
            traffic and pipeline metrics here.
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

  return (
    <div className="bg-slate-50 pb-20">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm text-primary">Broker analytics</p>
            <h1 className="text-4xl font-bold text-slate-900">Performance insights</h1>
            <p className="text-sm text-slate-600">
              Track listing reach, lead quality, and response benchmarks across your AfriBrok portfolio. The
              visualizations below use mock data to illustrate the broker analytics experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/broker/dashboard"
                className="inline-flex items-center rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                ← Back to dashboard
              </Link>
              <Link
                href="/broker/properties/new"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                + Add listing
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Account summary</p>
            <p className="mt-2 text-sm text-primary/90">
              Active listings: <span className="font-semibold">{activeListings}</span>
            </p>
            <p className="text-sm text-primary/90">
              Total inquiries: <span className="font-semibold">{totalInquiries}</span>
            </p>
            <p className="text-sm text-primary/90">
              Occupancy uplift: <span className="font-semibold">+12% YoY</span>
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-screen-2xl flex-col gap-10 px-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Key metrics
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {performanceMetrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                helper={metric.helper}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <TrafficSources />
          <LeadQuality />
        </section>

        <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <OccupancyTrend />
          <ResponseInsights />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <PipelineBreakdown />
          <ReviewInsights brokerName={broker.name} />
        </section>
      </main>
    </div>
  );
}

function MetricCard({
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

function TrafficSources() {
  const maxValue = Math.max(...trafficSources.map((item) => item.value));
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Listing traffic sources</h2>
        <span className="text-xs text-slate-500">Last 30 days</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Understand where prospects discover your listings to prioritize marketing efforts.
      </p>
      <div className="mt-6 space-y-4">
        {trafficSources.map((item) => (
          <div key={item.source}>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{item.source}</span>
              <span className="font-semibold text-slate-900">{item.value}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadQuality() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Lead quality score</h2>
      <p className="mt-2 text-sm text-slate-600">
        AfriBrok rates each inquiry on recency, completeness, and responsiveness to help you prioritize
        follow-ups.
      </p>
      <div className="mt-5 space-y-3 text-xs text-slate-600">
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
          <span className="font-semibold">High intent</span>
          <span>45%</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700">
          <span className="font-semibold">Moderate</span>
          <span>38%</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
          <span className="font-semibold text-slate-800">Low intent</span>
          <span className="text-slate-500">17%</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Tip: respond to high-intent leads within 60 minutes to maintain premium ranking.
      </p>
    </div>
  );
}

function OccupancyTrend() {
  const maxPercent = Math.max(...occupancyData.map((item) => item.percent));
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Occupancy trend</h2>
        <span className="text-xs text-slate-500">Portfolio view</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Track the percentage of managed units currently leased or sold to measure performance over time.
      </p>
      <div className="mt-6 flex items-end gap-4">
        {occupancyData.map((item) => (
          <div key={item.month} className="flex flex-col items-center gap-2">
            <div className="flex h-40 w-12 items-end rounded-md bg-slate-100">
              <div
                className="w-full rounded-md bg-primary"
                style={{ height: `${(item.percent / maxPercent) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs text-primary">
        Occupancy is trending upward. Highlight upcoming availability to maintain momentum.
      </div>
    </div>
  );
}

function ResponseInsights() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Response time insights</h2>
      <p className="mt-2 text-sm text-slate-600">
        Consistent response times boost your placement in AfriBrok search results.
      </p>
      <ul className="mt-5 space-y-3 text-sm text-slate-700">
        <li className="rounded-xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-900">Morning (7am - 12pm)</p>
          <p className="text-xs text-slate-500">Avg 1h 45m · Top performers respond in 1h</p>
        </li>
        <li className="rounded-xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-900">Afternoon (12pm - 6pm)</p>
          <p className="text-xs text-slate-500">Avg 2h 10m · Consider quick replies during peak inquiry hours</p>
        </li>
        <li className="rounded-xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-900">Evening (6pm - 10pm)</p>
          <p className="text-xs text-slate-500">Avg 3h 05m · Enable auto replies for off-hours</p>
        </li>
      </ul>
    </div>
  );
}

function PipelineBreakdown() {
  const total = inquiryStatusBreakdown.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Pipeline status</h2>
      <p className="mt-2 text-sm text-slate-600">
        Monitor each stage of your AfriBrok funnel to keep deals moving forward.
      </p>
      <div className="mt-5 flex flex-wrap gap-4">
        {inquiryStatusBreakdown.map((item) => {
          const percent = Math.round((item.value / total) * 100);
          const color =
            item.label === "Closed won"
              ? "bg-emerald-100 text-emerald-700"
              : item.label === "Closed lost"
              ? "bg-rose-100 text-rose-700"
              : "bg-slate-100 text-slate-700";
          return (
            <div key={item.label} className={`rounded-xl border border-slate-200 p-4 text-sm ${color}`}>
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs">{item.value} leads · {percent}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewInsights({ brokerName }: { brokerName: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Reputation highlights</h2>
      <p className="mt-2 text-sm text-slate-600">
        AfriBrok aggregates feedback from tenants, buyers, and corporate partners to maintain trust.
      </p>
      <div className="mt-5 space-y-3 text-sm text-slate-700">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">
            “{brokerName} guided us through a commercial lease in record time.”
          </p>
          <p className="mt-1 text-xs text-slate-500">Enterprise tech client · Verified on Jan 28</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">
            “Responsive and transparent during every step of our relocation.”
          </p>
          <p className="mt-1 text-xs text-slate-500">Diplomatic tenant · Verified on Feb 3</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Tip: ask satisfied clients to leave reviews to boost your AfriBrok profile.
      </p>
    </div>
  );
}
