"use client";

import Link from "next/link";
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, Mail, MessageSquare, Users, Phone, MapPin, Briefcase, LogIn } from "lucide-react";

export default function SellPage() {
  const benefits = [
    {
      icon: ShieldCheck,
      title: "Verified Brokers",
      description: "Connect with certified and licensed brokers who have been verified by AfriBrok",
    },
    {
      icon: Building2,
      title: "Wide Reach",
      description: "Your property will be listed on a trusted platform reaching thousands of qualified buyers",
    },
    {
      icon: CheckCircle2,
      title: "Secure Process",
      description: "Safe transactions with verified brokers and transparent communication",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <header className="border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="mx-auto max-w-screen-2xl px-6 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Sell your property
          </span>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 md:text-5xl">
            Have a property to sell?
          </h1>
          <p className="mt-3 max-w-3xl text-base text-slate-600 sm:text-lg">
            Connect with certified AfriBrok brokers to list and sell your property. Verified brokers will help you reach qualified buyers and ensure a smooth transaction process.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-12 space-y-12">
        {/* Benefits Section */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Why sell with AfriBrok brokers?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                1
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Connect with certified brokers</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Reach out to verified AfriBrok brokers in your area. They will help you create a professional listing for your property.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                2
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Broker creates your listing</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Certified brokers will add your property to their dashboard and create a professional listing on AfriBrok with all the details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                3
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Reach qualified buyers</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Your property will be listed on AfriBrok, reaching thousands of qualified buyers. Track inquiries and manage your sale through your broker.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Connect with Brokers */}
        <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Connect with certified brokers</h2>
            <p className="mb-6 text-sm text-slate-600">
              To list your property on AfriBrok, you need to work with a certified broker. Brokers have access to the dashboard where they can create and manage listings. Here's how to get started:
            </p>

            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Users className="h-5 w-5 text-primary" />
                  Find a certified broker
                </h3>
                <p className="mb-4 text-sm text-slate-600">
                  Browse our directory of verified brokers in your area. Each broker has been verified and certified by AfriBrok, ensuring they meet our quality standards.
                </p>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                  Browse certified brokers
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact brokers directly
                </h3>
                <p className="mb-4 text-sm text-slate-600">
                  Reach out to brokers through their contact information or visit their listings pages to send inquiries. They will help you create a professional listing for your property.
                </p>
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  View broker listings
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
                  <Briefcase className="h-5 w-5 text-primary" />
                  How brokers add listings
                </h3>
                <p className="mb-4 text-sm text-slate-700">
                  Once you connect with a broker, they will:
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Sign in to their broker dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Create a new listing from the dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Add your property details, photos, and pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Publish the listing on AfriBrok marketplace</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-8">
              <h3 className="mb-4 text-lg font-semibold text-primary">Already a broker?</h3>
              <p className="mb-4 text-sm text-primary/80">
                If you're a certified broker, sign in to your dashboard to create and manage listings directly.
              </p>
              <div className="space-y-2">
                <Link
                  href="/signin"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  href="/broker/apply"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Apply to become a broker
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Need help?</h3>
              <p className="mb-4 text-sm text-slate-600">
                Have questions about selling your property? Our support team is here to help.
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:support@afribrok.com"
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  support@afribrok.com
                </a>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact us
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Browse listings</h3>
              <p className="mb-4 text-sm text-slate-600">
                See how other properties are listed on AfriBrok to get an idea of what to expect.
              </p>
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                View listings
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

