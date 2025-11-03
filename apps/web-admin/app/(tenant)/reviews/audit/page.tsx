"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: {
    id: string;
    email: string;
    type: 'admin' | 'system' | 'broker' | 'user';
  };
  target: {
    type: 'broker' | 'listing' | 'user' | 'review' | 'transaction' | 'setting';
    id: string;
    name: string;
  };
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'authentication' | 'authorization' | 'data_modification' | 'system_change' | 'compliance';
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-1",
    timestamp: "2024-01-22T16:45:30Z",
    action: "BROKER_SUSPENDED",
    actor: {
      id: "admin-1",
      email: "admin@afribrok.et",
      type: "admin"
    },
    target: {
      type: "broker",
      id: "broker-bad1",
      name: "Questionable Properties"
    },
    details: "Broker account suspended due to fraudulent listing activities",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    severity: "critical",
    category: "compliance",
    changes: [
      {
        field: "status",
        oldValue: "active",
        newValue: "suspended"
      },
      {
        field: "suspensionReason",
        oldValue: "",
        newValue: "Fraudulent listing activities"
      }
    ]
  },
  {
    id: "audit-2",
    timestamp: "2024-01-22T15:20:15Z",
    action: "LISTING_DELETED",
    actor: {
      id: "admin-2",
      email: "moderator@afribrok.et",
      type: "admin"
    },
    target: {
      type: "listing",
      id: "listing-fake1",
      name: "Fake Property Listing"
    },
    details: "Listing removed for containing fraudulent information and stolen photos",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "error",
    category: "compliance"
  },
  {
    id: "audit-3",
    timestamp: "2024-01-22T14:10:45Z",
    action: "ADMIN_LOGIN",
    actor: {
      id: "admin-1",
      email: "admin@afribrok.et",
      type: "admin"
    },
    target: {
      type: "setting",
      id: "auth-system",
      name: "Authentication System"
    },
    details: "Administrator successfully logged into admin panel",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    severity: "info",
    category: "authentication"
  },
  {
    id: "audit-4",
    timestamp: "2024-01-22T13:30:22Z",
    action: "SETTINGS_MODIFIED",
    actor: {
      id: "admin-1",
      email: "admin@afribrok.et",
      type: "admin"
    },
    target: {
      type: "setting",
      id: "platform-settings",
      name: "Platform Settings"
    },
    details: "Platform settings updated - registration policy changed",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    severity: "warning",
    category: "system_change",
    changes: [
      {
        field: "enableRegistrations",
        oldValue: "true",
        newValue: "false"
      },
      {
        field: "registrationMessage",
        oldValue: "",
        newValue: "Registration temporarily disabled for maintenance"
      }
    ]
  },
  {
    id: "audit-5",
    timestamp: "2024-01-22T12:45:10Z",
    action: "REVIEW_APPROVED",
    actor: {
      id: "moderator-1",
      email: "moderator@afribrok.et",
      type: "admin"
    },
    target: {
      type: "review",
      id: "review-123",
      name: "Broker Review - Tadesse Real Estate"
    },
    details: "User review approved after moderation",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Ubuntu; Linux x86_64) AppleWebKit/537.36",
    severity: "info",
    category: "data_modification",
    changes: [
      {
        field: "status",
        oldValue: "pending_moderation",
        newValue: "approved"
      }
    ]
  },
  {
    id: "audit-6",
    timestamp: "2024-01-22T11:20:33Z",
    action: "FAILED_LOGIN_ATTEMPT",
    actor: {
      id: "unknown",
      email: "suspicious@hacker.com",
      type: "user"
    },
    target: {
      type: "setting",
      id: "auth-system",
      name: "Authentication System"
    },
    details: "Failed login attempt with invalid credentials - potential security threat",
    ipAddress: "203.0.113.42",
    userAgent: "curl/7.68.0",
    severity: "warning",
    category: "authentication"
  },
  {
    id: "audit-7",
    timestamp: "2024-01-22T10:15:18Z",
    action: "USER_ACCOUNT_CREATED",
    actor: {
      id: "system",
      email: "system@afribrok.et",
      type: "system"
    },
    target: {
      type: "user",
      id: "user-new123",
      name: "new.user@gmail.com"
    },
    details: "New user account created through registration flow",
    ipAddress: "197.156.64.23",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15",
    severity: "info",
    category: "authentication"
  },
  {
    id: "audit-8",
    timestamp: "2024-01-22T09:30:05Z",
    action: "BULK_DATA_EXPORT",
    actor: {
      id: "admin-1",
      email: "admin@afribrok.et",
      type: "admin"
    },
    target: {
      type: "broker",
      id: "bulk-export-001",
      name: "All Broker Data"
    },
    details: "Admin exported broker data for compliance reporting",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    severity: "warning",
    category: "data_modification"
  }
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setLogs(mockAuditLogs);
      setLoading(false);
    }, 800);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    const matchesActor = actorFilter === "all" || log.actor.type === actorFilter;
    return matchesSeverity && matchesCategory && matchesActor;
  });

  const severityCounts = {
    all: logs.length,
    critical: logs.filter(l => l.severity === 'critical').length,
    error: logs.filter(l => l.severity === 'error').length,
    warning: logs.filter(l => l.severity === 'warning').length,
    info: logs.filter(l => l.severity === 'info').length,
  };

  const categoryCounts = {
    authentication: logs.filter(l => l.category === 'authentication').length,
    authorization: logs.filter(l => l.category === 'authorization').length,
    data_modification: logs.filter(l => l.category === 'data_modification').length,
    system_change: logs.filter(l => l.category === 'system_change').length,
    compliance: logs.filter(l => l.category === 'compliance').length,
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </header>
        <main className="px-6 py-8">
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-500">
                Track all system activities, user actions, and security events
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/reviews"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to Reviews Overview
              </Link>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                onClick={() => alert("Export audit logs dialog (mock)")}
              >
                📥 Export Logs
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Severity Overview */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-900">{severityCounts.critical}</p>
              <p className="text-sm text-red-700">Critical</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-orange-900">{severityCounts.error}</p>
              <p className="text-sm text-orange-700">Error</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-900">{severityCounts.warning}</p>
              <p className="text-sm text-yellow-700">Warning</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{severityCounts.info}</p>
              <p className="text-sm text-blue-700">Info</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{severityCounts.all}</p>
              <p className="text-sm text-gray-700">Total Events</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication ({categoryCounts.authentication})</option>
              <option value="authorization">Authorization ({categoryCounts.authorization})</option>
              <option value="data_modification">Data Modification ({categoryCounts.data_modification})</option>
              <option value="system_change">System Change ({categoryCounts.system_change})</option>
              <option value="compliance">Compliance ({categoryCounts.compliance})</option>
            </select>

            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Actors</option>
              <option value="admin">Admin</option>
              <option value="system">System</option>
              <option value="broker">Broker</option>
              <option value="user">User</option>
            </select>

            <button
              onClick={() => {
                setSeverityFilter("all");
                setCategoryFilter("all");
                setActorFilter("all");
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>

          {/* Audit Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredLogs.length} Audit Log{filteredLogs.length !== 1 ? 's' : ''}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No audit logs found matching your criteria.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <AuditLogRow key={log.id} log={log} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AuditLogRow({ log }: { log: AuditLog }) {
  const severityColors = {
    critical: "bg-red-500",
    error: "bg-orange-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500"
  };

  const actorTypeIcons = {
    admin: "👤",
    system: "🤖",
    broker: "🏢",
    user: "👤"
  };

  const categoryIcons = {
    authentication: "🔐",
    authorization: "🛡️",
    data_modification: "📝",
    system_change: "⚙️",
    compliance: "📋"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatUserAgent = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return '🌐 Chrome';
    if (userAgent.includes('Firefox')) return '🦊 Firefox';
    if (userAgent.includes('Safari')) return '🧭 Safari';
    if (userAgent.includes('curl')) return '⚡ curl';
    return '🌐 Browser';
  };

  const handleLogAction = (action: string) => {
    console.log(`${action} audit log ${log.id}`);
    alert(`${action} audit log: ${log.action}`);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${severityColors[log.severity]}`} title={`${log.severity} severity`}></div>
            <span className="text-lg">{categoryIcons[log.category]}</span>
            <h4 className="text-lg font-semibold text-gray-900">
              {log.action.replace(/_/g, ' ')}
            </h4>
            <span className="text-sm text-gray-500">
              {formatDate(log.timestamp)}
            </span>
          </div>
          
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <span>{actorTypeIcons[log.actor.type]} {log.actor.email}</span>
            <span>🎯 {log.target.type}: {log.target.name}</span>
            <span>🌐 {log.ipAddress}</span>
            <span>{formatUserAgent(log.userAgent)}</span>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-800">
              {log.details}
            </p>
          </div>

          {log.changes && log.changes.length > 0 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-800 mb-2">Changes Made:</p>
              {log.changes.map((change, index) => (
                <div key={index} className="text-sm text-blue-700">
                  <span className="font-medium">{change.field}:</span>{' '}
                  <span className="text-red-600 line-through">{change.oldValue || '(empty)'}</span>
                  {' → '}
                  <span className="text-green-600">{change.newValue || '(empty)'}</span>
                </div>
              ))}
            </div>
          )}

          {log.severity === 'critical' && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800 font-medium">
                🚨 Critical Security Event: This action requires immediate attention and review.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {(log.severity === 'critical' || log.severity === 'error') && (
            <button
              onClick={() => handleLogAction("Investigate")}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
            >
              🔍 Investigate
            </button>
          )}
          <button
            onClick={() => handleLogAction("View Details")}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}