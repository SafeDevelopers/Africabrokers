"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search, Filter } from "lucide-react";
import { apiClient } from "../../../../lib/api-client";

interface Subscription {
  id: string;
  tenantId: string;
  subscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan?: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval: string;
    provider?: {
      name: string;
    };
  };
  tenant?: {
    id: string;
    slug: string;
    name: string;
  };
}

export default function AgencySubsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    tenantId: "",
    status: "",
    audience: "",
  });

  useEffect(() => {
    loadSubscriptions();
  }, [filters]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.tenantId) params.append("tenantId", filters.tenantId);
      if (filters.status) params.append("status", filters.status);
      if (filters.audience) params.append("audience", filters.audience);

      const data = await apiClient.get(
        `/superadmin/billing/subscriptions?${params.toString()}`,
        { includeTenant: false },
      );
      setSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agency Subscriptions</h1>
        <p className="mt-2 text-gray-600">View all subscriptions across tenants</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tenant ID</label>
              <input
                type="text"
                value={filters.tenantId}
                onChange={(e) => setFilters({ ...filters, tenantId: e.target.value })}
                placeholder="Filter by tenant..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="canceled">Canceled</option>
                <option value="past_due">Past Due</option>
                <option value="trialing">Trialing</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Audience</label>
              <select
                value={filters.audience}
                onChange={(e) => setFilters({ ...filters, audience: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Audiences</option>
                <option value="tenant">Tenant</option>
                <option value="broker">Broker</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancel At End</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sub.tenant?.name || sub.tenantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sub.plan?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sub.plan?.provider?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sub.status === "active"
                            ? "bg-green-100 text-green-800"
                            : sub.status === "canceled"
                            ? "bg-red-100 text-red-800"
                            : sub.status === "past_due"
                            ? "bg-yellow-100 text-yellow-800"
                            : sub.status === "trialing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(sub.currentPeriodStart).toLocaleDateString()} -{" "}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.plan?.currency} {sub.plan?.amount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sub.cancelAtPeriodEnd ? (
                        <span className="text-red-600">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
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

