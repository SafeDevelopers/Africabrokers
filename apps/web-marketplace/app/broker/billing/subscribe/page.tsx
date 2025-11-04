"use client";

import Link from "next/link";
import { useAuth } from "../../../context/auth-context";
import { CreditCard, CheckCircle2, ArrowLeft } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
}

export default function BrokerSubscribePage() {
  const { user } = useAuth();

  const plans: Plan[] = [
    {
      id: "starter",
      name: "Starter",
      price: 99,
      currency: "ETB",
      interval: "month",
      features: [
        "Up to 10 active listings",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      price: 299,
      currency: "ETB",
      interval: "month",
      popular: true,
      features: [
        "Up to 50 active listings",
        "Priority support",
        "Advanced analytics",
        "QR code generation",
        "Referral program",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 799,
      currency: "ETB",
      interval: "month",
      features: [
        "Unlimited listings",
        "24/7 priority support",
        "Custom analytics",
        "API access",
        "White-label options",
        "Dedicated account manager",
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    // Handle plan selection
    console.log("Selected plan:", planId);
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
        <h1 className="text-3xl font-bold text-slate-900">Choose a Plan</h1>
        <p className="mt-2 text-sm text-slate-600">
          Select the plan that best fits your needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border p-6 shadow-sm ${
              plan.popular
                ? "border-primary bg-primary/5"
                : "border-slate-200 bg-white"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: plan.currency,
                    maximumFractionDigits: 0,
                  }).format(plan.price)}
                </span>
                <span className="text-sm text-slate-500">/{plan.interval}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
                plan.popular
                  ? "bg-primary text-white shadow-sm hover:bg-primary/90"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              {plan.popular ? "Current Plan" : "Select Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
