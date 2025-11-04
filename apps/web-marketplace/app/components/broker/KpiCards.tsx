"use client";

import { TrendingUp, Eye, QrCode, Users } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, change, changeType = "neutral", icon }: KpiCardProps) {
  const changeColors = {
    increase: "text-emerald-600",
    decrease: "text-red-600",
    neutral: "text-slate-500",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 truncate">{label}</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-medium ${changeColors[changeType]}`}>
              {changeType === "increase" && "↗ "}
              {changeType === "decrease" && "↘ "}
              {change}
            </p>
          )}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </div>
  );
}

interface KpiCardsProps {
  activeListings: number;
  newLeads: number;
  views7d: number;
  saves?: number;
  inquiries?: number;
  scans7d: number;
}

export function KpiCards({ activeListings, newLeads, views7d, saves = 0, inquiries = 0, scans7d }: KpiCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        label="Active Listings"
        value={activeListings}
        change="+2 this month"
        changeType="increase"
        icon={<TrendingUp className="w-6 h-6" />}
      />
      <KpiCard
        label="New Leads"
        value={newLeads}
        change="Last 7 days"
        changeType="increase"
        icon={<Users className="w-6 h-6" />}
      />
      <KpiCard
        label="Views (7d)"
        value={views7d}
        change="+15% vs last week"
        changeType="increase"
        icon={<Eye className="w-6 h-6" />}
      />
      <KpiCard
        label="Saves"
        value={saves}
        change="Total saves"
        changeType="neutral"
        icon={<TrendingUp className="w-6 h-6" />}
      />
      <KpiCard
        label="Inquiries"
        value={inquiries}
        change="Total inquiries"
        changeType="neutral"
        icon={<Users className="w-6 h-6" />}
      />
      <KpiCard
        label="QR Scans (7d)"
        value={scans7d}
        change="+8 vs last week"
        changeType="increase"
        icon={<QrCode className="w-6 h-6" />}
      />
    </div>
  );
}

