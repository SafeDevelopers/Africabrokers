"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HealthCheck {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number | null;
  lastError: string | null;
  lastCheck: string | null;
}

const ENDPOINTS = [
  { name: 'Service Status', path: '/v1/_status' },
  { name: 'Pending Reviews', path: '/v1/admin/reviews/pending' },
  { name: 'Pending Verifications', path: '/v1/admin/verifications/pending' },
  { name: 'Pending Payouts', path: '/v1/admin/payouts/pending' },
  { name: 'Notification Stats', path: '/v1/admin/notifications/stats' },
];

export default function HealthPage() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const checkEndpoint = async (endpoint: { name: string; path: string }): Promise<HealthCheck> => {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'down' = 'down';
    let lastError: string | null = null;
    let latency: number | null = null;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_CORE_API_BASE_URL || 'http://localhost:4000';
      const url = `${baseUrl}${endpoint.path}`;

      // Get token from cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {} as Record<string, string>);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (cookies['afribrok-token']) {
        headers['Authorization'] = `Bearer ${cookies['afribrok-token']}`;
      }

      // Always send X-Tenant header
      const tenantId = cookies['afribrok-tenant-id'] || cookies['afribrok-tenant'] || 'et-addis';
      headers['X-Tenant'] = tenantId;
      headers['x-tenant-id'] = tenantId;

      const response = await fetch(url, {
        headers,
        credentials: 'include',
        cache: 'no-store',
      });

      latency = Date.now() - startTime;

      if (response.ok) {
        status = latency < 500 ? 'healthy' : 'degraded';
      } else {
        status = 'down';
        lastError = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      latency = Date.now() - startTime;
      status = 'down';
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    return {
      endpoint: endpoint.name,
      status,
      latency,
      lastError,
      lastCheck: new Date().toISOString(),
    };
  };

  const runChecks = async () => {
    setLoading(true);
    const results = await Promise.all(ENDPOINTS.map(endpoint => checkEndpoint(endpoint)));
    setChecks(results);
    setLoading(false);
  };

  useEffect(() => {
    runChecks();
    // Refresh every 30 seconds
    const interval = setInterval(runChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };

  const statusLabels = {
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Down',
  };

  const overallStatus = checks.length > 0
    ? checks.every(c => c.status === 'healthy')
      ? 'healthy'
      : checks.some(c => c.status === 'down')
        ? 'down'
        : 'degraded'
    : 'down';

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
              <p className="text-sm text-gray-500">Monitor API endpoint status, latency, and errors</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={runChecks}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking...' : 'Refresh'}
              </button>
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        {/* Overall Status */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Overall Status</h2>
              <p className="text-sm text-gray-600 mt-1">
                {checks.length} endpoint{checks.length !== 1 ? 's' : ''} checked
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${statusColors[overallStatus]}`}></div>
              <span className="text-lg font-semibold text-gray-900 capitalize">{statusLabels[overallStatus]}</span>
            </div>
          </div>
        </div>

        {/* Endpoint Checks */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Endpoint Health Checks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {checks.map((check, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-3 h-3 rounded-full ${statusColors[check.status]}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-900">{check.endpoint}</h3>
                        <span className="text-xs text-gray-500 capitalize">{statusLabels[check.status]}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
                        {check.latency !== null && (
                          <span>Latency: {check.latency}ms</span>
                        )}
                        {check.lastCheck && (
                          <span>Last check: {new Date(check.lastCheck).toLocaleTimeString()}</span>
                        )}
                      </div>
                      {check.lastError && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                          Error: {check.lastError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {checks.length === 0 && !loading && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-600">No health checks available</p>
          </div>
        )}
      </main>
    </div>
  );
}

