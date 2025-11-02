"use client";

import Link from "next/link";
import { useAuth } from "../../context/auth-context";

export default function SellerDashboardPage() {
  const { user } = useAuth();

  if (!user || (user.role !== "individual" && user.role !== "real-estate")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Access restricted</h1>
          <p className="mt-3 text-sm text-slate-600">
            This workspace is reserved for approved AfriBrok sellers. Sign in with the correct account or contact support if you believe this is an error.
          </p>
          <Link href="/auth/login" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (user.status !== "approved") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Approval in progress</h1>
          <p className="mt-3 text-sm text-slate-600">
            Your seller account is still pending review. We will notify you once listings can be created. In the meantime you can explore the marketplace or prepare property details.
          </p>
          <Link href="/seller/pending" className="mt-4 inline-flex rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10">
            View status page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 pb-20">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-6 py-10">
          <div>
            <p className="text-sm text-primary">Seller workspace</p>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-slate-600">
              Listing creation tools are coming soon. An AfriBrok concierge can help publish your first property manually while the full seller portal ships.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="mailto:concierge@afribrok.com" className="rounded-md bg-primary px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary/90">
              Contact concierge team
            </Link>
            <Link href="/listings" className="rounded-md border border-primary/40 px-4 py-2 font-semibold text-primary transition hover:bg-primary/10">
              Explore marketplace
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-screen-xl px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">What you can expect</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• Guided property onboarding with QR-ready marketing assets.</li>
            <li>• Performance summaries to track viewing requests and inquiries.</li>
            <li>• Optional AfriBrok photography, floor plans, and copywriting services.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
