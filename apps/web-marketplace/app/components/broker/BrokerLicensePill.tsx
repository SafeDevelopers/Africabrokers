"use client";

import { CheckCircle, AlertCircle, Clock } from "lucide-react";

type LicenseStatus = "ACTIVE" | "EXPIRED" | "SUSPENDED" | "PENDING";

interface BrokerLicensePillProps {
  licenseNumber: string;
  status: LicenseStatus;
  expiresAt?: string;
  verified?: boolean;
}

export function BrokerLicensePill({
  licenseNumber,
  status,
  expiresAt,
  verified = false,
}: BrokerLicensePillProps) {
  const statusConfig = {
    ACTIVE: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      icon: CheckCircle,
      label: "Active",
    },
    EXPIRED: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      icon: AlertCircle,
      label: "Expired",
    },
    SUSPENDED: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      icon: AlertCircle,
      label: "Suspended",
    },
    PENDING: {
      bg: "bg-slate-50 border-slate-200",
      text: "text-slate-700",
      icon: Clock,
      label: "Pending",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.bg} p-4 ${config.text}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide">License Status</p>
          <p className="mt-1 text-sm font-medium">
            {licenseNumber} · {config.label}
          </p>
          {expiresAt && (
            <p className="mt-1 text-xs opacity-75">Expires: {expiresAt}</p>
          )}
        </div>
        {verified && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
            ✓ Verified
          </span>
        )}
      </div>
    </div>
  );
}

