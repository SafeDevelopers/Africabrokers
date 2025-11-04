"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../../context/auth-context";

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
  provider?: {
    id: string;
    name: string;
  };
}

interface PaymentProvider {
  id: string;
  providerId: string;
  name: string;
  type: string;
  isActive: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || "http://localhost:8080";

export default function SubscribePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "broker") {
      router.push("/");
      return;
    }
    loadPlans();
    loadProviders();
  }, [user, router]);

  const loadPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/billing/plans`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Billing plans endpoint not found - API may not be configured yet");
          setPlans([]);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to load plans: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setPlans(Array.isArray(data.plans) ? data.plans : []);
    } catch (err) {
      console.error("Failed to load plans:", err);
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Cannot connect to billing service. Please ensure the API server is running.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load plans");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/billing/providers`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Billing providers endpoint not found - API may not be configured yet");
          setProviders([]);
          return;
        }
        console.error(`Failed to load providers: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      setProviders(
        Array.isArray(data.providers)
          ? data.providers.filter((p: PaymentProvider) => p.isActive)
          : [],
      );
    } catch (err) {
      console.error("Failed to load providers:", err);
      // Don't set error for providers, just log it
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedProvider) {
      alert("Please select a plan and payment method");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/v1/billing/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          planId: selectedPlan.planId,
          providerId: selectedProvider.providerId,
        }),
      });

      const data = await response.json();

      if (data.redirectUrl) {
        // Redirect to payment provider
        window.location.href = data.redirectUrl;
      } else if (data.nextAction === "payment_method_required") {
        // Handle payment method collection
        alert("Please complete payment method setup");
      } else {
        // Subscription created successfully
        router.push("/billing/invoices");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscribe to a Plan</h1>
        <p className="mt-2 text-gray-600">Choose a subscription plan and payment method</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plans Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Select a Plan
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                No plans available
              </div>
            ) : (
              plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    selectedPlan?.id === plan.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    {selectedPlan?.id === plan.id && (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {plan.currency} {plan.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      per {plan.intervalCount} {plan.interval}(s)
                    </div>
                    {plan.trialPeriodDays != null && plan.trialPeriodDays > 0 && (
                      <div className="text-sm text-indigo-600 font-semibold">
                        {plan.trialPeriodDays} days trial
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Payment Method Selection & Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </h2>
          <div className="space-y-2">
            {providers.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-sm">
                No payment methods available
              </div>
            ) : (
              providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedProvider?.id === provider.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{provider.name}</div>
                      <div className="text-xs text-gray-500">{provider.type}</div>
                    </div>
                    {selectedProvider?.id === provider.id && (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Summary */}
          {selectedPlan && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Subscription Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedPlan.currency} {selectedPlan.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing:</span>
                  <span className="font-semibold text-gray-900">
                    Every {selectedPlan.intervalCount} {selectedPlan.interval}(s)
                  </span>
                </div>
                {selectedPlan.trialPeriodDays != null && selectedPlan.trialPeriodDays > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trial:</span>
                    <span className="font-semibold text-indigo-600">
                      {selectedPlan.trialPeriodDays} days
                    </span>
                  </div>
                )}
                {selectedProvider && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-semibold text-gray-900">{selectedProvider.name}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSubscribe}
                disabled={!selectedPlan || !selectedProvider || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  "Processing..."
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

