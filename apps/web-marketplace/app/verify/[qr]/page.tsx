"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { brokers, getListingsByBroker } from "../../../data/mock-data";

const verificationCodes: Record<string, string> = {
  "AFR-QR-156": "broker-1",
  "AFR-QR-287": "broker-2",
  "AFR-QR-402": "broker-3"
};

type VerificationState =
  | { status: "loading" }
  | { status: "success"; brokerId: string }
  | { status: "error"; message: string };

export default function VerifyQRPage() {
  const params = useParams();
  const router = useRouter();
  const qrCode = (params?.qr as string) || "";
  const [state, setState] = useState<VerificationState>({ status: "loading" });

  useEffect(() => {
    if (!qrCode) {
      setState({
        status: "error",
        message: "Invalid QR code format. Please scan again or enter the code manually."
      });
      return;
    }

    // Simulate API call delay
    const timer = setTimeout(() => {
      const normalized = qrCode.trim().toUpperCase();
      const brokerId = verificationCodes[normalized];
      
      if (!brokerId) {
        setState({
          status: "error",
          message: "We couldn't find a broker with that code. Double-check and try again."
        });
        return;
      }
      
      setState({ status: "success", brokerId });
    }, 500);

    return () => clearTimeout(timer);
  }, [qrCode]);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying broker code...</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12">
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Broker verification</p>
              <h1 className="text-3xl font-bold text-slate-900">Verification Error</h1>
            </div>
          </div>
        </header>

        <main className="mx-auto mt-10 flex max-w-screen-xl flex-col gap-10 px-6">
          <section className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h2 className="text-lg font-semibold text-rose-900">We couldn't verify this broker</h2>
                  <p className="text-sm text-rose-700 mt-1">{state.message}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push("/verify")}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
                >
                  Try another code
                </button>
                <Link
                  href="/verify"
                  className="block w-full rounded-lg border border-primary/40 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Enter code manually
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const brokerId = state.brokerId;
  const broker = brokers.find((item) => item.id === brokerId);
  
  if (!broker) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Broker not found</p>
          <Link href="/verify" className="mt-4 text-primary hover:underline">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  const listings = getListingsByBroker(brokerId);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12">
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Broker verification</p>
            <h1 className="text-3xl font-bold text-slate-900">Broker Verified</h1>
            <p className="text-sm text-slate-600">
              The broker code has been successfully verified.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-screen-xl flex-col gap-10 px-6 lg:flex-row">
        <section className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-emerald-900">
                  {broker.name} is verified on AfriBrok
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  License #{broker.licenseNumber} · {broker.location}
                </p>
              </div>
              <span className="text-2xl">{broker.avatar}</span>
            </div>

            <div className="rounded-md border border-emerald-200 bg-white/80 p-4 text-emerald-700">
              <p className="text-xs uppercase tracking-wide">Trusted specialties</p>
              <p className="mt-1 text-sm">{broker.specialties.join(" · ")}</p>
              <p className="mt-2 text-xs text-emerald-600">
                Typical response time: {broker.stats.responseTime} · Rating {broker.stats.rating.toFixed(1)}
              </p>
            </div>

            {listings.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700 mb-2">Active listings</p>
                <ul className="space-y-2 text-sm">
                  {listings.slice(0, 5).map((listing) => (
                    <li key={listing.id} className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-white/80 p-3">
                      <span>{listing.title}</span>
                      <Link href={`/listings/${listing.id}`} className="text-xs font-semibold text-primary hover:underline">
                        View →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/brokers/${broker.id}`}
                className="rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Contact broker
              </Link>
              <button
                type="button"
                onClick={() => router.push("/verify")}
                className="rounded-md border border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                Verify another code
              </button>
            </div>
          </div>
        </section>

        <aside className="lg:w-96">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">About verification</h2>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>This broker is licensed and verified by AfriBrok</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>All listings are verified for accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Secure transaction processing available</span>
              </li>
            </ul>

            <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
              <p className="font-semibold">✅ Verified brokers always display an AfriBrok holographic seal on their badge.</p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Link
                href="/verify"
                className="text-sm font-semibold text-primary hover:underline"
              >
                ← Verify another broker
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

