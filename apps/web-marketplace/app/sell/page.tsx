"use client";

import Link from "next/link";
import { Building2, Shield, Users, CheckCircle2, ArrowRight } from "lucide-react";

export default function SellPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Sell Your Property</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Connect with certified brokers to list and sell your property through AfriBrok's verified marketplace.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Main Content */}
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-semibold text-slate-900">How It Works</h2>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Find a Certified Broker</h3>
                    <p className="text-sm text-slate-600">
                      Browse our verified broker directory and select a broker who matches your property type and location.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Contact & Consult</h3>
                    <p className="text-sm text-slate-600">
                      Reach out directly through our platform. Share property details and get professional advice.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">List & Verify</h3>
                    <p className="text-sm text-slate-600">
                      Your broker will create a verified listing with QR code verification for potential buyers.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Why Use Certified Brokers?</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Verified Credentials</p>
                    <p className="text-sm text-slate-600">All brokers are licensed and verified by AfriBrok</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">QR Code Verification</p>
                    <p className="text-sm text-slate-600">Buyers can instantly verify broker credentials before engaging</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Professional Marketing</p>
                    <p className="text-sm text-slate-600">Expert photography, listing optimization, and marketplace visibility</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Secure Transactions</p>
                    <p className="text-sm text-slate-600">Protected processes and verified buyer interactions</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Ready to Sell?</h2>
              <p className="text-sm text-slate-600 mb-6">
                Browse our directory of certified brokers and find the right professional for your property.
              </p>
              <Link
                href="/brokers"
                className="inline-flex items-center gap-2 w-full justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Browse Brokers
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900">Become a Broker</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Are you a licensed real estate professional? Apply to become a certified AfriBrok broker and start listing properties today.
              </p>
              <Link
                href="/broker/apply"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/listings" className="text-primary hover:underline">
                    Browse Property Listings
                  </Link>
                </li>
                <li>
                  <Link href="/verify" className="text-primary hover:underline">
                    Verify a Broker
                  </Link>
                </li>
                <li>
                  <Link href="/agents" className="text-primary hover:underline">
                    For Governments & Agencies
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

