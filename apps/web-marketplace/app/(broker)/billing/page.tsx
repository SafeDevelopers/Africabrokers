"use client";

import Link from "next/link";
import { CreditCard, Calendar, FileText, Plus } from "lucide-react";
import { useState } from "react";

interface Plan {
  name: string;
  amount: number;
  currency: string;
  interval: string;
  renewalDate: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  date: string;
  description: string;
}

export default function BrokerBillingPage() {
  const [currentPlan] = useState<Plan | null>({
    name: "Professional Plan",
    amount: 299,
    currency: "ETB",
    interval: "month",
    renewalDate: "2025-02-15",
  });
  const [invoices] = useState<Invoice[]>([]);
  const [loading] = useState(false);

  // Mock data - replace with API call using api() hook
  // const { data: plan } = useCurrentPlan();
  // const { data: invoices, loading } = useInvoices();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
        <p className="mt-2 text-sm text-slate-600">Manage your subscription and invoices</p>
      </div>

      {/* Current Plan */}
      {currentPlan ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Plan</p>
                  <p className="text-lg font-semibold text-slate-900">{currentPlan.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {currentPlan.currency} {currentPlan.amount.toLocaleString()} /{" "}
                    {currentPlan.interval}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Renewal Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDate(currentPlan.renewalDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/billing/subscribe"
              className="rounded-xl border border-primary/40 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Change Plan
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <CreditCard className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No active plan</h3>
          <p className="text-sm text-slate-600 mb-6">
            Subscribe to a plan to unlock all features
          </p>
          <Link
            href="/billing/subscribe"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Subscribe to a Plan
          </Link>
        </div>
      )}

      {/* Invoices */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Invoices</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-600">No invoices yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-6 hover:bg-slate-50 transition flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-slate-900">{invoice.description}</p>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {formatDate(invoice.date)} • {invoice.currency}{" "}
                    {invoice.amount.toLocaleString()}
                  </p>
                </div>
                <button className="rounded-lg px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition">
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

