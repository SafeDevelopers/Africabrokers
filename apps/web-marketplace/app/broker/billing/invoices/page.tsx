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

export default function BrokerInvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock data
        const mockInvoices: Invoice[] = [
          {
            id: "INV-2024-001",
            date: "2024-01-15",
            amount: 299,
            currency: "ETB",
            status: "paid",
            description: "Professional Plan - January 2024",
          },
          {
            id: "INV-2024-002",
            date: "2023-12-15",
            amount: 299,
            currency: "ETB",
            status: "paid",
            description: "Professional Plan - December 2023",
          },
          {
            id: "INV-2024-003",
            date: "2023-11-15",
            amount: 299,
            currency: "ETB",
            status: "paid",
            description: "Professional Plan - November 2023",
          },
        ];
        
        setInvoices(mockInvoices);
      } catch (error) {
        console.error("Failed to load invoices", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

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
