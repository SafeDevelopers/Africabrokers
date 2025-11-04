"use client";

import Link from "next/link";
import { useAuth } from "../../context/auth-context";
import { CreditCard, Calendar, CheckCircle2, ArrowRight } from "lucide-react";

export default function BrokerBillingPage() {
  const { user } = useAuth();

  const currentPlan = {
    name: "Professional",
    price: 299,
    currency: "ETB",
    interval: "month",
    status: "active",
    nextBillingDate: "2024-02-15",
    features: [
      "Up to 50 active listings",
      "Priority support",
      "Advanced analytics",
      "QR code generation",
    ],
  };

  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      amount: 299,
      currency: "ETB",
      status: "paid",
    },
    {
      id: "INV-2024-002",
      date: "2023-12-15",
      amount: 299,
      currency: "ETB",
      status: "paid",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{currentPlan.name}</h3>
              <p className="text-sm text-slate-600">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currentPlan.currency,
                }).format(currentPlan.price)}
                /{currentPlan.interval}
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">
              {currentPlan.status.toUpperCase()}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {currentPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {feature}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              Next billing date: {new Date(currentPlan.nextBillingDate).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-3">
            <Link
              href="/broker/billing/subscribe"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Change Plan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Invoices */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
          </div>
          <Link
            href="/broker/billing/invoices"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {invoices.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No invoices yet</p>
          ) : (
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{invoice.id}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(invoice.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-slate-900">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: invoice.currency,
                    }).format(invoice.amount)}
                  </p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
