"use client";

import Link from "next/link";
import { TenantPill } from "./TenantPill";
import { ServiceGrid } from "./ServiceGrid";
import { Building2, ShieldCheck, CheckCircle, Clock, QrCode, Home, Briefcase } from "lucide-react";

const stats = [
  { label: "Verified Brokers", value: "156+", icon: ShieldCheck },
  { label: "Active Listings", value: "1,247", icon: Building2 },
  { label: "Successful Deals", value: "892", icon: CheckCircle },
  { label: "Avg Response Time", value: "< 2 hrs", icon: Clock },
];

export function LandingHubClient() {

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-16 md:py-24">
        <div className="relative mx-auto max-w-5xl space-y-8 text-center">
          {/* Tenant Pill */}
          <div className="flex justify-center">
            <TenantPill />
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
              Verified properties.{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Trusted brokers.
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
              Explore licensed listings and confirm broker status instantly. Connect with certified
              professionals for reliable property transactions.
            </p>
          </div>

          {/* Verify Broker Button */}
          <div className="mx-auto max-w-xl">
            <Link
              href="/verify"
              className="group flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-5 text-lg font-bold text-white shadow-2xl ring-2 ring-indigo-500/20 transition-all hover:shadow-3xl hover:scale-105 hover:from-indigo-700 hover:to-purple-700 active:scale-100"
            >
              <QrCode className="w-6 h-6" />
              <span>Verify Broker QR Code</span>
            </Link>
            <p className="mt-4 text-center text-sm text-gray-500">
              Scan or enter a broker's QR code to verify their license and status instantly
            </p>
          </div>
        </div>
      </section>

      {/* Property Type Selection */}
      <PropertyTypeSection />

      {/* Service Cards Grid */}
      <ServiceGrid />

      {/* Stats Row */}
      <StatsSectionComponent />
    </>
  );
}

function PropertyTypeSection() {
  const propertyTypes = [
    {
      label: "For Sell",
      href: "/listings?purpose=Sale",
      icon: Home,
      description: "Browse properties available for purchase",
    },
    {
      label: "For Rent",
      href: "/listings?purpose=Rent",
      icon: Building2,
      description: "Find properties available for rent",
    },
    {
      label: "For Business",
      href: "/listings?type=Office",
      icon: Briefcase,
      description: "Explore commercial properties and spaces",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 md:text-4xl">
          I am looking property for?
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {propertyTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Link
                key={index}
                href={type.href}
                className="group relative rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transition-transform group-hover:scale-110">
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-2 text-center text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                  {type.label}
                </h3>
                <p className="text-center text-sm text-gray-600">{type.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatsSectionComponent() {
  return (
    <section className="border-b border-gray-200 bg-gradient-to-b from-white to-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group text-center transition-transform hover:scale-105"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transition-transform group-hover:scale-110">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


