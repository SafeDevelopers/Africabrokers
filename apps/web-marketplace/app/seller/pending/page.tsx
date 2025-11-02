"use client";

import Link from "next/link";
import { useAuth } from "../../context/auth-context";

export default function SellerPendingPage() {
  const { user } = useAuth();
  const name = user?.name ?? "Partner";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-16">
      <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
          🗂️
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Application received, {name.split(" ")[0]}!</h1>
        <p className="mt-3 text-sm text-slate-600">
          Individual sellers and real-estate agencies require a quick compliance review before listing tools are enabled. Our partnerships team will be in touch shortly.
        </p>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Need to prepare anything?</p>
          <ul className="space-y-2 text-left">
            <li>• Keep proof of ownership or mandate letters ready.</li>
            <li>• Share sample marketing photos so we can pre-seed your profile.</li>
            <li>• Set preferred contact details for AfriBrok concierge routing.</li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col gap-3 text-sm text-primary sm:flex-row sm:justify-center">
          <Link href="mailto:partners@afribrok.com" className="font-semibold hover:underline">
            Reach partnerships team →
          </Link>
          <Link href="/listings" className="font-semibold hover:underline">
            Browse active listings →
          </Link>
        </div>
      </div>
    </div>
  );
}
