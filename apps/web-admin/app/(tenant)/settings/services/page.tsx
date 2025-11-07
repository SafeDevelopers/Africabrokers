"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface ServiceStatusInfo {
  status: 'ok' | 'degraded' | 'down';
  latencyMs: number;
  updatedAt: string;
}

interface StatusResponse {
  services: {
    reviews: ServiceStatusInfo;
    verifications: ServiceStatusInfo;
    payouts: ServiceStatusInfo;
    notifications: ServiceStatusInfo;
  };
  version: string;
  time: string;
}

interface EndpointInfo {
  name: string;
  path: string;
  required: boolean;
  lastStatus?: 'healthy' | 'degraded' | 'down';
  lastCheck?: string;
  latency?: number;
}

const ENDPOINTS: EndpointInfo[] = [
  { name: 'Pending Reviews', path: '/v1/admin/reviews/pending', required: true },
  { name: 'Pending Verifications', path: '/v1/admin/verifications/pending', required: true },
  { name: 'Pending Payouts', path: '/v1/admin/payouts/pending', required: true },
  { name: 'Notification Stats', path: '/v1/admin/notifications/stats', required: false },
];

export default function ServicesPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [endpointChecks, setEndpointChecks] = useState<Record<string, EndpointInfo>>({});

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_CORE_API_BASE_URL || 'http://localhost:4000';
      const url = `${baseUrl}/v1/_status`;
      
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

      const tenantId = cookies['afribrok-tenant-id'] || cookies['afribrok-tenant'] || 'et-addis';
      headers['X-Tenant'] = tenantId;
      headers['x-tenant-id'] = tenantId;
      
      const response = await fetch(url, {
        headers,
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStatus(data);
      
      // Check individual endpoints
      const checks: Record<string, EndpointInfo> = {};
      for (const endpoint of ENDPOINTS) {
        const startTime = Date.now();
        try {
          const endpointUrl = `${baseUrl}${endpoint.path}`;
          const endpointResponse = await fetch(endpointUrl, {
            headers,
            credentials: 'include',
            cache: 'no-store',
          });
          const latency = Date.now() - startTime;
          
          checks[endpoint.path] = {
            ...endpoint,
            lastStatus: endpointResponse.ok ? (latency < 500 ? 'healthy' : 'degraded') : 'down',
            lastCheck: new Date().toISOString(),
            latency,
          };
        } catch (err) {
          checks[endpoint.path] = {
            ...endpoint,
            lastStatus: 'down',
            lastCheck: new Date().toISOString(),
            latency: Date.now() - startTime,
          };
        }
      }
      setEndpointChecks(checks);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch service status'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
    ok: 'bg-green-500',
  };

  const statusLabels = {
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Down',
    ok: 'OK',
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Status</h1>
                <p className="text-sm text-gray-500">
                  Monitor required endpoints and their health status
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Overall Service Status */}
          {status && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Service Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(status.services).map(([name, service]) => (
                  <div key={name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{name}</span>
                      <div className={`w-3 h-3 rounded-full ${statusColors[service.status]}`}></div>
                    </div>
                    <p className="text-xs text-gray-500">{statusLabels[service.status]}</p>
                    <p className="text-xs text-gray-400 mt-1">{service.latencyMs}ms</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Endpoints */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Endpoints</h2>
            <div className="space-y-3">
              {ENDPOINTS.map((endpoint) => {
                const check = endpointChecks[endpoint.path];
                const status = check?.lastStatus || 'down';
                return (
                  <div
                    key={endpoint.path}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{endpoint.name}</span>
                        {endpoint.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{endpoint.path}</p>
                      {check?.lastCheck && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last check: {new Date(check.lastCheck).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {check && (
                        <>
                          <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                          <span className="text-sm text-gray-700">{statusLabels[status]}</span>
                          {check.latency !== undefined && (
                            <span className="text-xs text-gray-500">{check.latency}ms</span>
                          )}
                        </>
                      )}
                      {!check && loading && (
                        <span className="text-xs text-gray-400">Checking...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

