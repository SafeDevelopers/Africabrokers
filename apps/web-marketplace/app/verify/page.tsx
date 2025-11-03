"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, ShieldCheck, MapPin, Phone, Mail } from "lucide-react";
import { getTenant } from "../../lib/tenant";

type VerificationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: BrokerVerificationData }
  | { status: "error"; message: string };

interface BrokerVerificationData {
  valid: boolean;
  broker?: {
    id: string;
    name: string;
    company: string;
    licenseNumber: string;
    location: string;
    verified: boolean;
    rating: number;
    specialties: string[];
    phone: string;
    email: string;
    stats: {
      activeListings: number;
      closedDeals: number;
      responseTime: string;
    };
  };
  tenant?: {
    name: string;
    key: string;
  };
  verifiedAt?: string;
  qrCodeId: string;
}

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, setState] = useState<VerificationState>({ status: "idle" });

  // Extract code from URL if it's a deep link (e.g., /verify/{code})
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'verify') {
      const urlCode = pathParts[2];
      if (urlCode && urlCode !== 'page') {
        setCode(urlCode);
        handleVerify(urlCode);
      }
    }
  }, []);

  const handleVerify = async (qrCode?: string) => {
    const codeToVerify = qrCode || code.trim().toUpperCase();
    if (!codeToVerify) {
      setState({ status: "error", message: "Enter the code displayed on the broker's QR badge." });
      return;
    }

    setState({ status: "loading" });

    try {
      const tenant = getTenant();
      const apiBase = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || "http://localhost:8080";
      
      const response = await fetch(`${apiBase}/v1/verify/${encodeURIComponent(codeToVerify)}`, {
        headers: {
          "Content-Type": "application/json",
          "X-Tenant": tenant,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 404) {
          setState({
            status: "error",
            message: "We couldn't find a broker with that code. Double-check and try again.",
          });
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data: BrokerVerificationData = await response.json();
      
      if (!data.valid || !data.broker) {
        setState({
          status: "error",
          message: "This broker code is not valid or has been revoked.",
        });
        return;
      }

      setState({ status: "success", data });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to verify broker code. Please try again.",
      });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleVerify();
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
              <Link href="mailto:safety@afribrok.com" className="font-medium text-indigo-600 hover:underline">
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
            <button className="rounded-lg border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50">
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
                disabled={state.status === "loading"}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-lg tracking-[0.35em] text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50"
                aria-describedby="verifyCodeHelp"
              />
              <p id="verifyCodeHelp" className="text-xs text-slate-500">
                You&apos;ll find this code under the broker&apos;s QR. Format: AFR-QR-XXX
              </p>
            </div>

            <button
              type="submit"
              disabled={state.status === "loading"}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {state.status === "loading" ? "Verifying..." : "Verify broker"}
            </button>
          </form>

          <VerificationResult state={state} onReset={() => setState({ status: "idle" })} />
        </section>

        <aside className="lg:w-96">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">About verification</h2>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Verified brokers display an AfriBrok holographic seal on their badge</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>All licenses and credentials are confirmed before approval</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Use the AfriBrok Inspector mobile app for instant scanning</span>
              </li>
            </ul>

            <div className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-700">
              <p className="font-semibold mb-2">Scan with the AfriBrok mobile app</p>
              <p className="mb-3 text-indigo-600">
                Launch the AfriBrok Inspector app to scan QR badges instantly. The app cross-checks licenses,
                confirms office addresses, and stores verification receipts.
              </p>
              <Link
                href="/agents"
                className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:underline"
              >
                Learn about becoming an agent →
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function VerificationResult({
  state,
  onReset,
}: {
  state: VerificationState;
  onReset: () => void;
}) {
  if (state.status === "idle" || state.status === "loading") {
    if (state.status === "loading") {
      return (
        <div className="mt-6 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-slate-700">Verifying broker code...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  if (state.status === "error") {
    return (
      <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">We couldn&apos;t verify this broker.</p>
            <p className="mt-1">{state.message}</p>
          </div>
        </div>
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

  const { data } = state;
  if (!data.broker) return null;

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-base font-semibold text-emerald-900">
              {data.broker.name} is verified on AfriBrok
            </p>
          </div>
          <p className="text-xs text-emerald-700">
            License #{data.broker.licenseNumber} · {data.broker.location}
          </p>
        </div>
        <span className="text-2xl">{data.broker.verified ? "✓" : "⚠"}</span>
      </div>

      <div className="rounded-md border border-emerald-200 bg-white/80 p-4 text-emerald-700">
        <p className="text-xs uppercase tracking-wide mb-1">Trusted specialties</p>
        <p className="text-sm">{data.broker.specialties.join(" · ")}</p>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="font-semibold">{data.broker.stats.activeListings}</p>
            <p className="text-emerald-600">Listings</p>
          </div>
          <div>
            <p className="font-semibold">{data.broker.stats.closedDeals}</p>
            <p className="text-emerald-600">Deals</p>
          </div>
          <div>
            <p className="font-semibold">{data.broker.stats.responseTime}</p>
            <p className="text-emerald-600">Response</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-emerald-200">
        <Link
          href={`tel:${data.broker.phone}`}
          className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <Phone className="w-4 h-4" />
          Call
        </Link>
        <Link
          href={`mailto:${data.broker.email}`}
          className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <Mail className="w-4 h-4" />
          Email
        </Link>
        <Link
          href={`/brokers/${data.broker.id}`}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          View Profile
        </Link>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-xs font-medium text-emerald-700 hover:underline"
      >
        Verify another code
      </button>
    </div>
  );
}
