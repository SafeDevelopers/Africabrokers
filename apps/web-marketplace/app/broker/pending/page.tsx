"use client";

import Link from "next/link";
import { useAuth } from "../../context/auth-context";

export default function BrokerPendingPage() {
  const { user } = useAuth();

  const name = user?.name ?? "Broker";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-16">
      <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
          ⏳
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Thanks for applying, {name.split(" ")[0]}!</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your documents are under review. AfriBrok will issue your verified QR badge once the license and ID checks are complete. Expect an email within two business days.
        </p>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">What happens next?</p>
          <ul className="space-y-2 text-left">
            <li>• We validate your brokerage license with the issuing authority.</li>
            <li>• Once approved, a single AfriBrok QR code is generated for your profile.</li>
            <li>• You’ll gain access to the broker dashboard, analytics, and listing tools.</li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col gap-3 text-sm text-primary sm:flex-row sm:justify-center">
          <Link href="/broker/apply" className="font-semibold hover:underline">
            Review submitted application →
          </Link>
          <Link href="mailto:verification@afribrok.com" className="font-semibold hover:underline">
            Contact verification team →
          </Link>
        </div>
      </div>
    </div>
  );
}
