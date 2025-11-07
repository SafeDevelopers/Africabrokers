"use client";

import Link from "next/link";
import { useAuth } from "../../../context/auth-context";
import { CreditCard, Download, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  description: string;
}

const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
const TENANT_KEY = process.env.NEXT_PUBLIC_TENANT_KEY;

const mapStatus = (status: string): Invoice["status"] => {
  if (status === "paid") return "paid";
  if (status === "open" || status === "draft") return "pending";
  return "overdue";
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value && typeof value === "object" && "toNumber" in (value as any)) {
    try {
      return (value as any).toNumber();
    } catch {
      return 0;
    }
  }
  return 0;
};

export default function BrokerInvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (user?.role !== "broker") {
        setError("Switch to a broker account to view invoices.");
        setInvoices([]);
        setLoading(false);
        return;
      }

      if (!CORE_API_BASE_URL) {
        setError("Core API base URL is not configured.");
        setInvoices([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${CORE_API_BASE_URL}/v1/billing/invoices/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(TENANT_KEY ? { "X-Tenant": TENANT_KEY } : {}),
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Broker authentication required. Please sign in again.");
          }
          const text = await response.text().catch(() => response.statusText);
          throw new Error(`Failed to load invoices: ${response.status} ${text}`);
        }

        const data = await response.json();
        const mapped: Invoice[] = (data.invoices || []).map((item: any) => ({
          id: item.invoiceNumber || item.id,
          date: item.createdAt,
          amount: toNumber(item.amount || item.paidAmount),
          currency: item.currency || "ETB",
          status: mapStatus(item.status),
          description:
            item.subscription?.name ||
            item.metadata?.description ||
            item.provider?.name ||
            "Subscription invoice",
        }));

        setInvoices(mapped);
      } catch (error) {
        let errorMessage = "Failed to load invoices";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String(error.message);
        }
        // Handle network errors
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          errorMessage = "Network error: Unable to connect to the API. Please check your connection and try again.";
        }
        setError(errorMessage);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user?.role]);

  const handleDownload = (invoiceId: string) => {
    // Handle invoice download
    console.log("Download invoice:", invoiceId);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/broker/billing"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
        <p className="mt-2 text-sm text-slate-600">
          View and download your billing invoices
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">No invoices found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">{invoice.id}</h3>
                  </div>
                  <p className="text-sm text-slate-600">{invoice.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(invoice.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: invoice.currency,
                      }).format(invoice.amount)}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        invoice.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : invoice.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownload(invoice.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
