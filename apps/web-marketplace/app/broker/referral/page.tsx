"use client";

import { useState } from "react";
import { ReferralLinkCard } from "../../components/broker/ReferralLinkCard";

export default function ReferralPage() {
  const [referralUrl, setReferralUrl] = useState<string>("");
  const [qrCodeSvg, setQrCodeSvg] = useState<string>("");

  // Mock function - replace with actual API call to POST /v1/broker/referrals
  const handleGenerateLink = async (): Promise<string> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In production, this would be:
    // const response = await fetch('/api/v1/broker/referrals', { method: 'POST', ... });
    // const data = await response.json();
    // return data.url;
    
    const mockUrl = `https://afribrok.com/sell?ref=${Date.now()}&sig=abc123def456`;
    setReferralUrl(mockUrl);
    
    // Generate QR code SVG (mock - replace with actual QR code generation)
    const mockQrSvg = `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="white"/>
      <text x="128" y="128" font-family="Arial" font-size="12" text-anchor="middle">QR Code</text>
      <text x="128" y="140" font-family="Arial" font-size="10" text-anchor="middle">${mockUrl}</text>
    </svg>`;
    setQrCodeSvg(mockQrSvg);
    
    return mockUrl;
  };

  const metrics = {
    totalLeads: 47,
    leads7d: 12,
    conversionRate: 23.4,
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Referral Program</h1>
          <p className="mt-2 text-sm text-slate-600">
            Generate referral links and QR codes to grow your lead pipeline
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-8">
        <ReferralLinkCard
          referralUrl={referralUrl}
          onGenerate={handleGenerateLink}
          qrCodeSvg={qrCodeSvg}
          metrics={metrics}
        />
      </main>
    </div>
  );
}

