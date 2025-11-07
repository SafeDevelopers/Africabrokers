"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { KpiCards } from "../../components/broker/KpiCards";

export default function BrokerDashboard() {
  const { user } = useAuth();

  const kpiData = {
    activeListings: 0,
    newLeads: 0,
    views7d: 0,
    saves: 0,
    inquiries: 0,
    scans7d: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome back, {user?.name || "Broker"}
        </p>
      </div>

      <section>
        <div className="mb-4 rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
          Connect your analytics endpoints to populate these KPIs. Until then the values default to zero.
        </div>
        <KpiCards {...kpiData} />
      </section>

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
            href="/broker/listings/new"
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
