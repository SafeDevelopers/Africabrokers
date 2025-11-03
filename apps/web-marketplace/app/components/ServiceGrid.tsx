"use client";

import { Building2, ShieldCheck, UserCheck, Users, Home, FileText } from "lucide-react";
import { ServiceCard } from "./ServiceCard";

export function ServiceGrid() {
  const services = [
    {
      icon: Building2,
      title: "Browse Listings",
      description: "Explore verified property listings in your area. Filter by price, location, and property type.",
      href: "/listings",
    },
    {
      icon: ShieldCheck,
      title: "Verify Broker QR",
      description: "Scan or enter a broker's QR code to verify their license, credentials, and verification status.",
      href: "/verify",
    },
    {
      icon: UserCheck,
      title: "Become a Certified Broker",
      description: "Join AfriBrok as a verified broker. Get certified, build trust, and connect with qualified buyers.",
      href: "/broker/apply",
    },
    {
      icon: Home,
      title: "For Sellers",
      description: "Connect with certified brokers to list and sell your property. Browse verified brokers and contact them directly - no account required.",
      href: "/sell",
    },
    {
      icon: FileText,
      title: "For Buyers",
      description: "Browse verified properties, connect with trusted brokers, and make informed real estate decisions.",
      href: "/listings",
    },
    {
      icon: Users,
      title: "For Governments & Agencies",
      description: "Access enforcement tools, verify broker compliance, and manage property listings in your region.",
      href: "/agents",
      secondaryHref: "/agents/apply",
      secondaryLabel: "Apply to become an agent",
    },
  ];

  return (
    <section id="services" className="bg-white px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Our Services
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Everything you need for trusted real estate transactions, all in one place.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}

