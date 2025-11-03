"use client";

import { useState } from "react";
import { Copy, Check, QrCode, Link2, BarChart3 } from "lucide-react";

interface ReferralLinkCardProps {
  referralUrl?: string;
  onGenerate?: () => Promise<string>;
  qrCodeSvg?: string;
  metrics?: {
    totalLeads: number;
    leads7d: number;
    conversionRate: number;
  };
}

export function ReferralLinkCard({
  referralUrl,
  onGenerate,
  qrCodeSvg,
  metrics,
}: ReferralLinkCardProps) {
  const [url, setUrl] = useState(referralUrl || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (onGenerate) {
      setIsGenerating(true);
      try {
        const newUrl = await onGenerate();
        setUrl(newUrl);
      } catch (error) {
        console.error("Failed to generate referral link", error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleCopy = async () => {
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Link Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Link2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">Referral Link</h2>
        </div>

        {!url ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Generate a unique referral link to share with potential clients. Leads that come through this link will be automatically assigned to you.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Generate Referral Link
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Share this link on social media, email, or your website to start receiving leads.
            </p>
          </div>
        )}
      </div>

      {/* QR Code Display */}
      {qrCodeSvg && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">QR Code</h2>
          </div>
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
            <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} className="w-64 h-64" />
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Download or print this QR code for physical marketing materials
          </p>
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Referral Metrics</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Leads</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.totalLeads}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last 7 Days</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.leads7d}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conversion</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.conversionRate}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

