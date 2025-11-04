"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus, TestTube, Power, Eye, EyeOff } from "lucide-react";
import { apiClient } from "../../../../lib/api-client";

interface PaymentProvider {
  id: string;
  tenantId: string;
  providerId: string;
  type: string;
  audience?: string;
  name: string;
  config: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  tenant?: {
    id: string;
    slug: string;
    name: string;
  };
}

export default function ProvidersRegistryPage() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    tenantId: "",
    providerId: "",
    type: "STRIPE" as "STRIPE" | "TELEBIRR" | "MPESA" | "CASH",
    audience: "",
    name: "",
    config: {} as Record<string, any>,
    isDefault: false,
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/superadmin/billing/providers", {
        includeTenant: false,
      });
      setProviders(Array.isArray(data.providers) ? data.providers : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/superadmin/billing/providers", formData, {
        includeTenant: false,
      });
      setShowAddModal(false);
      setFormData({
        tenantId: "",
        providerId: "",
        type: "STRIPE",
        audience: "",
        name: "",
        config: {},
        isDefault: false,
      });
      loadProviders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create provider");
    }
  };

  const handleTest = async (providerId: string) => {
    try {
      setTestingProvider(providerId);
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) return;

      const tenantId = provider.tenantId;
      const response = await apiClient.post(
        `/admin/billing/providers/${providerId}/test`,
        { amount: 100, currency: "ETB" },
        { includeTenant: false },
      );

      if (response.success) {
        alert(`Test successful: ${response.testResult?.message || "OK"}`);
      } else {
        alert(`Test failed: ${response.error || "Unknown error"}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggle = async (providerId: string) => {
    try {
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) return;

      const tenantId = provider.tenantId;
      await apiClient.post(
        `/admin/billing/providers/${providerId}/toggle`,
        {},
        { includeTenant: false },
      );
      loadProviders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle provider");
    }
  };

  const toggleConfigVisibility = (providerId: string) => {
    setShowConfig((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading providers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Providers Registry</h1>
          <p className="mt-2 text-gray-600">Manage global payment provider configurations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Config</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No providers found
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{provider.name}</span>
                        {provider.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {provider.tenant?.name || provider.tenantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {provider.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {provider.audience || "both"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {provider.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleConfigVisibility(provider.id)}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        {showConfig[provider.id] ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Show
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTest(provider.id)}
                          disabled={testingProvider === provider.id}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          title="Test Provider"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(provider.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title={provider.isActive ? "Disable" : "Enable"}
                        >
                          <Power className={`w-4 h-4 ${provider.isActive ? "text-green-600" : "text-gray-400"}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Payment Provider</h2>
              <form onSubmit={handleAddProvider} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
                  <input
                    type="text"
                    required
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="et-addis"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider ID</label>
                  <input
                    type="text"
                    required
                    value={formData.providerId}
                    onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="stripe-main"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STRIPE">Stripe</option>
                    <option value="TELEBIRR">Telebirr</option>
                    <option value="MPESA">M-Pesa</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Stripe Main Account"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Audience (optional)</label>
                  <input
                    type="text"
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="broker, tenant, or both"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Config (JSON - encrypted credentials)
                  </label>
                  <textarea
                    required
                    value={JSON.stringify(formData.config, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, config: JSON.parse(e.target.value) });
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    rows={6}
                    placeholder='{"apiKey": "...", "webhookSecret": "..."}'
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                    Set as default provider
                  </label>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create Provider
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

