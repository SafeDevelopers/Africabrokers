"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus, TestTube, Eye, EyeOff } from "lucide-react";
import { apiClient } from "../../../../lib/api-client";

interface PaymentProvider {
  id: string;
  providerId: string;
  type: string;
  audience?: string;
  name: string;
  config: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    providerId: "",
    type: "TELEBIRR" as "STRIPE" | "TELEBIRR" | "MPESA" | "CASH" | "FLUTTERWAVE" | "CHAPA",
    audience: "both",
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
      const data = await apiClient.get("/admin/billing/providers");
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
      await apiClient.post("/admin/billing/providers", formData);
      setShowAddModal(false);
      setFormData({
        providerId: "",
        type: "TELEBIRR",
        audience: "both",
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
      const response = await apiClient.post(
        `/admin/billing/providers/${providerId}/test`,
        { amount: 100, currency: "ETB" },
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
      await apiClient.post(`/admin/billing/providers/${providerId}/toggle`, {});
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
        <div className="text-gray-500">Loading payment methods...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="mt-2 text-gray-600">Configure payment providers for this tenant</p>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            No payment providers configured
          </div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-xs text-gray-500">{provider.type}</p>
                  </div>
                </div>
                {provider.isDefault && (
                  <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`font-semibold ${
                      provider.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {provider.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Audience:</span>
                  <span className="text-gray-900">{provider.audience || "both"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => toggleConfigVisibility(provider.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showConfig[provider.id] ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide Config
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show Config
                    </>
                  )}
                </button>
                {showConfig[provider.id] && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(provider.config, null, 2)}
                    </pre>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTest(provider.id)}
                    disabled={testingProvider === provider.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
                  >
                    <TestTube className="w-4 h-4" />
                    {testingProvider === provider.id ? "Testing..." : "Test"}
                  </button>
                  <button
                    onClick={() => handleToggle(provider.id)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      provider.isActive
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {provider.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Payment Provider</h2>
              <form onSubmit={handleAddProvider} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider ID</label>
                  <input
                    type="text"
                    required
                    value={formData.providerId}
                    onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="telebirr-main"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TELEBIRR">Telebirr</option>
                    <option value="CASH">Cash</option>
                    <option value="MPESA">M-Pesa</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="FLUTTERWAVE">Flutterwave</option>
                    <option value="CHAPA">Chapa</option>
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
                    placeholder="Telebirr Main Account"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Audience</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="both">Both (Broker & Tenant)</option>
                    <option value="broker">Broker Only</option>
                    <option value="tenant">Tenant Only</option>
                  </select>
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
                    rows={8}
                    placeholder='{"apiKey": "...", "webhookSecret": "...", "encrypted": true}'
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Store encrypted credentials here. API keys and secrets will be encrypted at rest.
                  </p>
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

