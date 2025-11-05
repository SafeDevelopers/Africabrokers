"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { apiClient } from "../../../../lib/api-client";

interface Plan {
  id: string;
  planId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount?: number;
  trialPeriodDays?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  provider?: {
    id: string;
    name: string;
  };
}

interface GlobalPlanLimits {
  minAmount?: number;
  maxAmount?: number;
  minInterval?: number;
  maxInterval?: number;
}

export default function BrokerPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [globalLimits, setGlobalLimits] = useState<GlobalPlanLimits>({});

  const [formData, setFormData] = useState({
    providerId: "",
    audience: "broker",
    planId: "",
    name: "",
    description: "",
    amount: 0,
    currency: "ETB",
    interval: "month",
    intervalCount: 1,
    trialPeriodDays: 0,
    gracePeriodDays: 0,
    metadata: {} as Record<string, any>,
  });

  useEffect(() => {
    loadPlans();
    loadGlobalLimits();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/admin/billing/plans");
      setPlans(Array.isArray(data.plans) ? data.plans : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalLimits = async () => {
    try {
      // Load global limits from settings (if available)
      const limits = await apiClient.get("/admin/billing/plans/limits");
      setGlobalLimits(limits || {});
    } catch (err) {
      // Ignore if endpoint doesn't exist
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate against global limits
    if (globalLimits.minAmount && formData.amount < globalLimits.minAmount) {
      alert(`Amount must be at least ${globalLimits.minAmount} ${formData.currency}`);
      return;
    }
    if (globalLimits.maxAmount && formData.amount > globalLimits.maxAmount) {
      alert(`Amount must not exceed ${globalLimits.maxAmount} ${formData.currency}`);
      return;
    }

    try {
      if (editingPlan) {
        await apiClient.put(`/admin/billing/plans/${editingPlan.id}`, formData);
      } else {
        await apiClient.post("/admin/billing/plans", formData);
      }
      setShowAddModal(false);
      setEditingPlan(null);
      setFormData({
        providerId: "",
        audience: "broker",
        planId: "",
        name: "",
        description: "",
        amount: 0,
        currency: "ETB",
        interval: "month",
        intervalCount: 1,
        trialPeriodDays: 0,
        gracePeriodDays: 0,
        metadata: {},
      });
      loadPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save plan");
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await apiClient.delete(`/admin/billing/plans/${planId}`);
      loadPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete plan");
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      providerId: plan.provider?.id || "",
      audience: (plan.metadata as any)?.audience || "broker",
      planId: plan.planId,
      name: plan.name,
      description: plan.description || "",
      amount: Number(plan.amount),
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount || 1,
      trialPeriodDays: plan.trialPeriodDays || 0,
      gracePeriodDays: (plan.metadata as any)?.gracePeriodDays || 0,
      metadata: plan.metadata || {},
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broker Plans</h1>
          <p className="mt-2 text-gray-600">Manage subscription plans for brokers</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {(globalLimits.minAmount || globalLimits.maxAmount) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Global Plan Limits</p>
            <ul className="list-disc list-inside space-y-1">
              {globalLimits.minAmount && (
                <li>Minimum amount: {globalLimits.minAmount} {formData.currency}</li>
              )}
              {globalLimits.maxAmount && (
                <li>Maximum amount: {globalLimits.maxAmount} {formData.currency}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            No plans found
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {plan.currency} {plan.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Interval:</span>
                  <span className="text-gray-900">
                    {plan.intervalCount} {plan.interval}(s)
                  </span>
                </div>
                 {plan.trialPeriodDays != null && plan.trialPeriodDays > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trial:</span>
                    <span className="text-gray-900">{plan.trialPeriodDays} days</span>
                  </div>
                )}
                {(plan.metadata as any)?.gracePeriodDays > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Grace:</span>
                    <span className="text-gray-900">{(plan.metadata as any).gracePeriodDays} days</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Provider:</span>
                  <span className="text-gray-900">{plan.provider?.name || "N/A"}</span>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingPlan ? "Edit Plan" : "Add Broker Plan"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan ID</label>
                    <input
                      type="text"
                      required
                      value={formData.planId}
                      onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      required
                      min={globalLimits.minAmount || 0}
                      max={globalLimits.maxAmount}
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    {globalLimits.minAmount && (
                      <p className="mt-1 text-xs text-gray-500">
                        Min: {globalLimits.minAmount} {formData.currency}
                      </p>
                    )}
                    {globalLimits.maxAmount && (
                      <p className="mt-1 text-xs text-gray-500">
                        Max: {globalLimits.maxAmount} {formData.currency}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      required
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ETB">ETB</option>
                      <option value="USD">USD</option>
                      <option value="KES">KES</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interval</label>
                    <select
                      required
                      value={formData.interval}
                      onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interval Count</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.intervalCount}
                      onChange={(e) => setFormData({ ...formData, intervalCount: parseInt(e.target.value) || 1 })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trial Period (days)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.trialPeriodDays}
                      onChange={(e) => setFormData({ ...formData, trialPeriodDays: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Grace Period (days)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.gracePeriodDays}
                      onChange={(e) => setFormData({ ...formData, gracePeriodDays: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingPlan(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingPlan ? "Update" : "Create"} Plan
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

