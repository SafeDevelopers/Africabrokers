"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  type: "broker_applied" | "broker_approved" | "listing_created" | "listing_removed" | "review_submitted" | "security_event" | "settings_changed";
  message: string;
  timestamp: string;
  actor: string;
  status: "success" | "warning" | "info" | "error";
}

const mockActivity: ActivityItem[] = [
  {
    id: "a-1",
    type: "broker_applied",
    message: "New broker application from Alemayehu Tadesse",
    timestamp: "5 minutes ago",
    actor: "system",
    status: "info",
  },
  {
    id: "a-2",
    type: "broker_approved",
    message: "Sara Mekonnen approved as certified broker",
    timestamp: "1 hour ago",
    actor: "admin@afribrok.et",
    status: "success",
  },
  {
    id: "a-3",
    type: "listing_created",
    message: "New property listing in Bole area - Premium Villa",
    timestamp: "2 hours ago",
    actor: "broker: Elite Homes",
    status: "info",
  },
  {
    id: "a-4",
    type: "review_submitted",
    message: "Review submitted for Dawit Kebede - pending decision",
    timestamp: "3 hours ago",
    actor: "user: buyer@gmail.com",
    status: "warning",
  },
  {
    id: "a-5",
    type: "security_event",
    message: "Multiple failed login attempts detected",
    timestamp: "5 hours ago",
    actor: "system",
    status: "error",
  },
  {
    id: "a-6",
    type: "settings_changed",
    message: "Platform settings updated - registration policy changed",
    timestamp: "yesterday",
    actor: "admin@afribrok.et",
    status: "warning",
  },
];

export default function ActivityFeedPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setTimeout(() => {
      setItems(mockActivity);
      setLoading(false);
    }, 600);
  }, []);

  const filtered = items.filter((i) => {
    const byType = typeFilter === "all" || i.type === (typeFilter as ActivityItem["type"]);
    const byStatus = statusFilter === "all" || i.status === (statusFilter as ActivityItem["status"]);
    return byType && byStatus;
  });

  const statusColor: Record<ActivityItem["status"], string> = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    error: "bg-red-100 text-red-800",
  };

  const typeIcon: Record<ActivityItem["type"], string> = {
    broker_applied: "👥",
    broker_approved: "✅",
    listing_created: "🏠",
    listing_removed: "🚫",
    review_submitted: "📝",
    security_event: "🔐",
    settings_changed: "⚙️",
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
              <p className="text-sm text-gray-500">All recent events across the platform</p>
            </div>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="broker_applied">Broker Applied</option>
                <option value="broker_approved">Broker Approved</option>
                <option value="listing_created">Listing Created</option>
                <option value="listing_removed">Listing Removed</option>
                <option value="review_submitted">Review Submitted</option>
                <option value="security_event">Security Event</option>
                <option value="settings_changed">Settings Changed</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          {/* Feed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {loading ? "Loading..." : `${filtered.length} event${filtered.length === 1 ? "" : "s"} found`}
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-6 py-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No activity matches your filters.</p>
                </div>
              ) : (
                filtered.map((a) => (
                  <div key={a.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{typeIcon[a.type]}</span>
                        <p className="text-sm text-gray-900 truncate">{a.message}</p>
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColor[a.status]}`}>
                          {a.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{a.timestamp}</p>
                        <p className="mt-1">by {a.actor}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
