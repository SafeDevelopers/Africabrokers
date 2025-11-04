"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { KpiCards } from "../../components/broker/KpiCards";

export default function BrokerDashboard() {
  const { user } = useAuth();

  // Mock KPI data - replace with API calls
  const kpiData = {
    activeListings: 8,
    newLeads: 12,
    views7d: 245,
    saves: 18,
    inquiries: 24,
    scans7d: 156,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome back, {user?.name || 'Broker'}
        </p>
      </div>

      {/* KPI Cards */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          At a glance
        </h2>
        <KpiCards
          activeListings={kpiData.activeListings}
          newLeads={kpiData.newLeads}
          views7d={kpiData.views7d}
          saves={kpiData.saves}
          inquiries={kpiData.inquiries}
          scans7d={kpiData.scans7d}
        />
      </section>

      {/* Create Listing CTA */}
      <section>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <Plus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Create your first listing
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Start listing properties to reach more buyers
          </p>
          <Link
            href="/listings/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Create Listing
          </Link>
        </div>
      </section>
    </div>
  );
}

