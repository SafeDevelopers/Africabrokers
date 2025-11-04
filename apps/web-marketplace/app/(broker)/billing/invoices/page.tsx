"use client";

import { useEffect, useState } from "react";
import { FileText, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "../../../context/auth-context";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  currency: string;
  paidAmount?: number;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  provider?: {
    name: string;
    type: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || "http://localhost:8080";

export default function BrokerInvoicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "broker") {
      router.push("/");
      return;
    }
    loadInvoices();
  }, [user, router]);

  const loadInvoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/billing/invoices/me`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Billing invoices endpoint not found - API may not be configured yet");
          setInvoices([]);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to load invoices: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Cannot connect to billing service. Please ensure the API server is running.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load invoices");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    // TODO: Implement PDF download
    alert("PDF download will be implemented soon");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "open":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "void":
      case "uncollectible":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "void":
      case "uncollectible":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
        <p className="mt-2 text-gray-600">View and download your invoice receipts</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.currency} {invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.paidAmount ? (
                        <>
                          {invoice.currency} {invoice.paidAmount.toLocaleString()}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            invoice.status,
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {invoice.status === "paid" && (
                        <button
                          onClick={() => handleDownloadPDF(invoice.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

