"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ShieldCheck, TrendingUp, Clock, Mail, Phone, Calendar, FileText, Users, Building2, AlertTriangle } from "lucide-react";
import { trackCta } from "../../lib/analytics";

const valueCards = [
  {
    title: "Registry & Licensing",
    description: "Access comprehensive broker registry, license verification, and compliance tracking tools.",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Enforcement Toolkit",
    description: "Issue violations, track compliance, and manage property inspections with mobile-first tools.",
    icon: ShieldCheck,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Verified Marketplace",
    description: "Monitor and moderate property listings, verify broker credentials, and ensure platform integrity.",
    icon: Building2,
    color: "from-purple-500 to-pink-500",
  },
];

const eligibilityItems = [
  "Government agency or regulatory body",
  "Licensed inspection organization",
  "Property management authority",
  "Real estate regulatory commission",
  "Municipal or regional property office",
];

const timelineSteps = [
  { step: 1, title: "Submit Application", description: "Complete the multi-step application form with organization details" },
  { step: 2, title: "Document Review", description: "Our team reviews your credentials and eligibility (5-7 business days)" },
  { step: 3, title: "Platform Access", description: "Receive login credentials and access to agent dashboard" },
  { step: 4, title: "Training & Onboarding", description: "Complete orientation and training on enforcement tools" },
  { step: 5, title: "Go Live", description: "Start verifying brokers and managing property listings" },
];

const faqItems = [
  {
    question: "Who can become an AfriBrok Agent?",
    answer: "Government agencies, regulatory bodies, licensed inspection organizations, and property management authorities are eligible to join the agent program.",
  },
  {
    question: "What tools do I get access to?",
    answer: "Agents receive access to the enforcement toolkit, broker registry, license verification, violation tracking, and property inspection management tools.",
  },
  {
    question: "How long does the application process take?",
    answer: "The review process typically takes 5-7 business days after submitting a complete application with all required documents.",
  },
  {
    question: "Is there a fee to become an agent?",
    answer: "Agent access is free for eligible government and regulatory organizations. Contact us for details about commercial inspection organizations.",
  },
  {
    question: "Can I use the mobile app for field inspections?",
    answer: "Yes! The AfriBrok Inspector mobile app is available for iOS and Android, allowing you to scan QR codes and conduct inspections offline.",
  },
];

export function AgentsPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
            Become an <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AfriBrok Agent</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            Join government agencies and regulatory bodies using AfriBrok to verify broker compliance,
            manage property listings, and enforce real estate regulations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/agents/apply"
              onClick={() => trackCta({ name: "Apply to Become an Agent", context: "agents-hero" })}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95"
            >
              Apply to Become an Agent
            </Link>
            <Link
              href="/verify"
              className="rounded-xl border-2 border-gray-200 bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:border-indigo-500/30 hover:bg-gray-50 hover:shadow-lg"
            >
              Try Verification Tool
            </Link>
          </div>
        </div>
      </section>

      {/* Value Cards */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl mb-3">Why Become an Agent?</h2>
            <p className="text-lg text-gray-600">Access powerful tools designed for regulatory compliance</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {valueCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-lg transition-all hover:border-indigo-500/30 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${card.color} text-white shadow-lg`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Eligibility & Timeline */}
      <section className="bg-slate-50/50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Eligibility */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Eligibility</h2>
              <div className="space-y-3">
                {eligibilityItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Application Timeline</h2>
              <div className="space-y-4">
                {timelineSteps.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className="text-gray-500">{openFaq === index ? "−" : "+"}</span>
                </button>
                {openFaq === index && (
                  <div className="border-t border-gray-200 px-6 py-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Block */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-indigo-200 bg-white p-8 shadow-xl md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
              <p className="text-lg text-gray-600">
                Have questions? Contact our team to learn more about the agent program.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Mail className="w-6 h-6" />
                </div>
                <p className="mb-1 text-sm font-semibold text-gray-900">Email</p>
                <a
                  href="mailto:agents@afribrok.com"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  agents@afribrok.com
                </a>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Phone className="w-6 h-6" />
                </div>
                <p className="mb-1 text-sm font-semibold text-gray-900">WhatsApp</p>
                <a
                  href="https://wa.me/251911234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  +251 911 234 567
                </a>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="mb-1 text-sm font-semibold text-gray-900">Book a Call</p>
                <a
                  href="https://calendly.com/afribrok-agents"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Schedule meeting
                </a>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/agents/apply"
                onClick={() => trackCta({ name: "Apply to Become an Agent", context: "agents-contact" })}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
              >
                Apply to Become an Agent
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

