"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { brokers, getListingsByBroker } from "../data/mock-data";

const verificationCodes: Record<string, string> = {
  "AFR-QR-156": "broker-1",
  "AFR-QR-287": "broker-2",
  "AFR-QR-402": "broker-3"
};

type VerificationState =
  | { status: "idle" }
  | { status: "success"; brokerId: string }
  | { status: "error"; message: string };

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<VerificationState>({ status: "idle" });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setState({ status: "error", message: "Enter the code displayed on the broker's QR badge." });
      return;
    }
    const brokerId = verificationCodes[normalized];
    if (!brokerId) {
      setState({
        status: "error",
        message: "We couldn't find a broker with that code. Double-check and try again."
      });
      return;
    }
    setState({ status: "success", brokerId });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Broker verification</p>
            <h1 className="text-3xl font-bold text-slate-900">Scan or enter a broker code</h1>
            <p className="text-sm text-slate-600">
              Every AfriBrok agent carries a QR-enabled badge. Scan it with your phone or enter the
              unique code to confirm their license, company, and current verification status.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Need help verifying?</p>
            <p className="mt-1">
              Brokers without a valid code are not allowed to transact on AfriBrok. Report suspicious
              encounters at{" "}
              <Link href="mailto:safety@afribrok.com" className="font-medium text-primary">
                safety@afribrok.com
              </Link>
              .
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-screen-xl flex-col gap-10 px-6 lg:flex-row">
        <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Enter broker code</h2>
              <p className="text-sm text-slate-600">
                Type the six-character code printed below the QR pattern. Letters are always uppercase.
              </p>
            </div>
            <button className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10">
              Launch camera scanner
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="verifyCode" className="text-sm font-medium text-slate-700">
                Broker verification code
              </label>
              <input
                id="verifyCode"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="AFR-QR-156"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-lg tracking-[0.35em] text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                aria-describedby="verifyCodeHelp"
              />
              <p id="verifyCodeHelp" className="text-xs text-slate-500">
                You&apos;ll find this code under the broker&apos;s QR. Format: AFR-QR-XXX
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
            >
              Verify broker
            </button>
          </form>

          <VerificationResult state={state} onReset={() => setState({ status: "idle" })} />
        </section>

        <aside className="lg:w-96">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Recently verified brokers</h2>
            <ul className="space-y-4 text-sm text-slate-700">
              {brokers.map((broker) => (
                <li key={broker.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between">
                    <span className="text-xl">{broker.avatar}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        broker.verified
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {broker.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{broker.name}</p>
                  <p className="text-xs text-slate-500">
                    License #{broker.licenseNumber} · {broker.location}
                  </p>
                  <Link
                    href={`/brokers/${broker.id}`}
                    className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline"
                  >
                    View profile →
                  </Link>
                </li>
              ))}
            </ul>

            <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
              ✅ Verified brokers always display an AfriBrok holographic seal on their badge.
            </div>
          </div>
        </aside>
      </main>

      <section className="mx-auto mt-10 max-w-screen-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1.5fr,1fr] md:items-center">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Scan with the AfriBrok mobile app</h2>
            <p className="text-sm text-slate-600">
              Launch the AfriBrok Inspector app to scan QR badges instantly. The app cross-checks licenses,
              confirms office addresses, and stores verification receipts for your records.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Works offline – scans sync once you reconnect</li>
              <li>• Save verifications per property or team member</li>
              <li>• Access tamper-proof history for audits</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Coming soon to iOS & Android</p>
            <p className="mt-1">
              Request early access by emailing{" "}
              <Link href="mailto:mobile@afribrok.com" className="font-medium text-primary">
                mobile@afribrok.com
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function VerificationResult({
  state,
  onReset
}: {
  state: VerificationState;
  onReset: () => void;
}) {
  if (state.status === "idle") return null;

  if (state.status === "error") {
    return (
      <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <p className="font-semibold">We couldn&apos;t verify this broker.</p>
        <p className="mt-1">{state.message}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-3 rounded-md border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
        >
          Try again
        </button>
      </div>
    );
  }

  const brokerId = state.brokerId;
  const broker = brokers.find((item) => item.id === brokerId);
  if (!broker) return null;

  const listings = getListingsByBroker(brokerId);

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-emerald-900">
            {broker.name} is verified on AfriBrok
          </p>
          <p className="text-xs text-emerald-700">
            License #{broker.licenseNumber} · {broker.location}
          </p>
        </div>
        <span className="text-lg">{broker.avatar}</span>
      </div>

      <div className="rounded-md border border-emerald-200 bg-white/80 p-4 text-emerald-700">
        <p className="text-xs uppercase tracking-wide">Trusted specialties</p>
        <p className="mt-1 text-sm">{broker.specialties.join(" · ")}</p>
        <p className="mt-2 text-xs text-emerald-600">
          Typical response time: {broker.stats.responseTime} · Rating {broker.stats.rating.toFixed(1)}
        </p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-emerald-700">Active listings</p>
        <ul className="mt-2 space-y-1 text-sm">
          {listings.slice(0, 3).map((listing) => (
            <li key={listing.id} className="flex items-center justify-between gap-3">
              <span>{listing.title}</span>
              <Link href={`/listings/${listing.id}`} className="text-xs font-semibold text-primary">
                View →
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/brokers/${broker.id}`}
          className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
        >
          Contact broker
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-emerald-700 hover:underline"
        >
          Verify another code
        </button>
      </div>
    </div>
  );
}
