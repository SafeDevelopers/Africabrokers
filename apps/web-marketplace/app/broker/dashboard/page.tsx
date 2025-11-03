"use client";

import Link from "next/link";
import { useEffect, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";
import { getBrokerById, getListingsByBroker } from "../../data/mock-data";
import { BrokerLicensePill } from "../../components/broker/BrokerLicensePill";
import { KpiCards } from "../../components/broker/KpiCards";
import { TasksList } from "../../components/broker/TasksList";
import { QrCode, Copy, Download, ExternalLink, RefreshCw } from "lucide-react";

const defaultBrokerId = "broker-1";

function BrokerDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Clean up URL params if they exist and user is already set
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // If user is already authenticated but URL has params, clean them up
    if (user && user.role === 'broker' && searchParams?.toString()) {
      const roleParam = searchParams?.get('role');
      const emailParam = searchParams?.get('email');
      const userIdParam = searchParams?.get('userId');
      const tokenParam = searchParams?.get('token');
      const hasAuthParams = roleParam || emailParam || userIdParam || tokenParam;
      
      if (hasAuthParams) {
        const cleanUrl = '/broker/dashboard';
        window.history.replaceState({}, '', cleanUrl);
        router.replace(cleanUrl, { scroll: false });
      }
    }
  }, [user, searchParams, router]);

  // Show loading if user is not set yet (may be loading from localStorage or URL params)
  if (!user) {
    // Check if we have cookies or URL params indicating auth is being set
    const hasCookies = typeof window !== 'undefined' && 
      document.cookie.split(';').some(c => c.trim().startsWith('afribrok-role=BROKER'));
    const hasParams = searchParams?.get('role') === 'BROKER' && searchParams?.get('token');
    
    // If we have cookies or params, wait a bit more (auth might still be processing)
    if (hasCookies || hasParams) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-slate-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    // No cookies or params, and no user - layout will handle redirect
    return null;
  }

  // Check if user is a broker - layout handles redirect, but we check here too
  if (user.role !== "broker" && user.role !== "real-estate") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-sm text-slate-600 mb-4">Only approved brokers can access this dashboard.</p>
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            Go to homepage →
          </Link>
        </div>
      </div>
    );
  }

  const brokerId = user.role === "real-estate" ? "broker-2" : defaultBrokerId;
  const broker = getBrokerById(brokerId);
  const brokerListings = getListingsByBroker(brokerId);

  if (!broker) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Broker profile not found</h1>
          <p className="text-sm text-slate-600">Please contact support to set up your broker account.</p>
        </div>
      </div>
    );
  }

  // Mock data - replace with API calls
  const kpiData = {
    activeListings: brokerListings.length,
    newLeads: 12,
    views7d: 247,
    saves: 45,
    inquiries: 28,
    scans7d: 18,
  };

  const tasks = [
    {
      id: "task-1",
      title: "2 leads uncontacted >24h",
      description: "Follow up with leads from yesterday",
      status: "urgent" as const,
      dueDate: "Today",
    },
    {
      id: "task-2",
      title: "3 docs expiring soon",
      description: "License renewal and compliance documents need attention",
      status: "urgent" as const,
      dueDate: "Next week",
    },
    {
      id: "task-3",
      title: "Follow up with 3 pending leads",
      description: "Respond to inquiries from yesterday",
      status: "pending" as const,
      dueDate: "Today",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="mt-2 text-sm text-slate-600">Welcome back, {broker.name}</p>
            </div>
            <Link
              href="/broker/listings/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              + New Listing
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-8">
        <div className="space-y-8">
          {/* KPIs - One row */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              At a glance
            </h2>
            <KpiCards {...kpiData} />
          </section>

          {/* License + QR Card */}
          <section>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <BrokerLicensePill
                  licenseNumber={broker.licenseNumber}
                  status="ACTIVE"
                  expiresAt="2025-12-31"
                  verified={broker.verified}
                />
                <button className="w-full rounded-lg border border-primary/40 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Renew License
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <QrCode className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-slate-900">Verification Assets</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Public Broker Page</p>
                      <p className="font-mono text-xs text-slate-700 mt-1 truncate">{`${typeof window !== 'undefined' ? window.location.origin : ''}/brokers/${brokerId}`}</p>
                    </div>
                    <button
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/brokers/${brokerId}`;
                        navigator.clipboard.writeText(url);
                      }}
                      className="ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-200 transition"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Verify URL</p>
                      <p className="font-mono text-xs text-slate-700 mt-1 truncate">{`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/qr-code-${brokerId}`}</p>
                    </div>
                    <button
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/qr-code-${brokerId}`;
                        navigator.clipboard.writeText(url);
                      }}
                      className="ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-200 transition"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        // Mock download - replace with actual QR download
                        window.open(`/broker/qr`, '_blank');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </button>
                    <button
                      onClick={() => {
                        // Mock print pack - replace with actual print pack functionality
                        window.open(`/broker/qr`, '_blank');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Print Pack
                    </button>
                  </div>
                  <Link
                    href="/broker/qr"
                    className="block text-center text-xs font-medium text-primary hover:underline"
                  >
                    View full QR details →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Tasks Card */}
          <section>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
                <span className="text-xs text-slate-500">
                  {tasks.filter((t) => t.status !== "completed").length} pending
                </span>
              </div>
              <TasksList tasks={tasks} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function BrokerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <BrokerDashboardContent />
    </Suspense>
  );
}

