"use client";

import { useEffect, useState } from "react";
import { FileText, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { apiClient } from "../../../../lib/api-client";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  currency: string;
  paidAmount?: number;
  dueDate?: string;
  paidAt?: string;
  customerId: string;
  customerType: string;
  provider?: {
    id: string;
    type: string;
    name: string;
  };
  subscription?: {
    id: string;
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [markPaidData, setMarkPaidData] = useState({
    collector: "",
    receiptNumber: "",
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      // Note: This endpoint would need to be created to list invoices for tenant admin
      const data = await apiClient.get("/admin/billing/invoices");
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    if (invoice.provider?.type !== "CASH") {
      alert("This action is only available for cash invoices");
      return;
    }
    setSelectedInvoice(invoice);
    setShowMarkPaidModal(true);
  };

  const handleSubmitMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await apiClient.post(
        `/admin/billing/invoices/${selectedInvoice.id}/cash/mark-paid`,
        {
          collector: markPaidData.collector,
          receiptNumber: markPaidData.receiptNumber,
        },
      );
      setShowMarkPaidModal(false);
      setSelectedInvoice(null);
      setMarkPaidData({ collector: "", receiptNumber: "" });
      loadInvoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark invoice as paid");
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="mt-2 text-gray-600">Manage invoices and payments</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
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
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
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
                      {invoice.customerType} ({invoice.customerId.substring(0, 8)}...)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.provider?.name || invoice.provider?.type || "N/A"}
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
                      {invoice.provider?.type === "CASH" && invoice.status !== "paid" && (
                        <button
                          onClick={() => handleMarkPaid(invoice)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <DollarSign className="w-4 h-4" />
                          Mark Paid
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

      {showMarkPaidModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mark Invoice as Paid</h2>
              <form onSubmit={handleSubmitMarkPaid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                  <input
                    type="text"
                    value={selectedInvoice.invoiceNumber}
                    disabled
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="text"
                    value={`${selectedInvoice.currency} ${selectedInvoice.amount.toLocaleString()}`}
                    disabled
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Collector Name *</label>
                  <input
                    type="text"
                    required
                    value={markPaidData.collector}
                    onChange={(e) => setMarkPaidData({ ...markPaidData, collector: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter collector name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt Number *</label>
                  <input
                    type="text"
                    required
                    value={markPaidData.receiptNumber}
                    onChange={(e) => setMarkPaidData({ ...markPaidData, receiptNumber: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter receipt number"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMarkPaidModal(false);
                      setSelectedInvoice(null);
                      setMarkPaidData({ collector: "", receiptNumber: "" });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Mark as Paid
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

