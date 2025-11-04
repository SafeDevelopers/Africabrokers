"use client";

import { useState } from "react";
import { useAuth } from "../../context/auth-context";
import { ReferralLinkCard } from "../../components/broker/ReferralLinkCard";

export default function BrokerReferralPage() {
  const { user } = useAuth();
  const [referralUrl, setReferralUrl] = useState<string>("");

  const handleGenerateReferralLink = async (): Promise<string> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}/broker/apply?ref=${user?.email || "broker"}`;
    setReferralUrl(url);
    return url;
  };

  const metrics = {
    totalLeads: 24,
    leads7d: 8,
    conversionRate: 12.5,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Referrals</h1>
        <p className="mt-2 text-sm text-slate-600">
          Share your referral link and track your referral performance
        </p>
      </div>

      <ReferralLinkCard
        referralUrl={referralUrl}
        onGenerate={handleGenerateReferralLink}
        metrics={metrics}
      />
    </div>
  );
}
