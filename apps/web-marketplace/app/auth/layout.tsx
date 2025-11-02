import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto flex min-h-screen max-w-screen-xl flex-col items-center justify-center px-6 py-16 lg:py-24">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          ← Back to marketplace
        </Link>
        <div className="grid w-full max-w-6xl items-center justify-items-center gap-16 text-center lg:grid-cols-[1fr,1.2fr] lg:text-left">
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-bold text-slate-900 lg:text-5xl">AfriBrok Marketplace</h1>
            <p className="text-base text-slate-600">
              Manage your property journey. Log in to track inquiries, save homes you love, and verify
              trusted brokers in Addis Ababa.
            </p>
            <div className="rounded-2xl border border-primary/10 bg-white/70 p-6 text-sm text-slate-600 shadow-md backdrop-blur">
              <p className="font-semibold text-slate-900">Why create an account?</p>
              <ul className="mt-3 space-y-2">
                <li>• Save favorite listings and receive updates from trusted brokers.</li>
                <li>• Manage inquiries and visit schedules from a single dashboard.</li>
                <li>• Verify broker credentials instantly with QR scanning.</li>
              </ul>
            </div>
          </div>

          <div className="flex w-full items-center justify-center">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl sm:p-12 lg:p-14">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
