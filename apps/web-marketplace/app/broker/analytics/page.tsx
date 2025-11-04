"use client";

import { useAuth } from "../../context/auth-context";
import { KpiCards } from "../../components/broker/KpiCards";
import { BarChart3 } from "lucide-react";

export default function BrokerAnalyticsPage() {
  const { user } = useAuth();

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
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track your listings performance and insights
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Key Metrics
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

      <section>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Performance Overview</h2>
          </div>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-600">
              Detailed analytics charts coming soon
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
