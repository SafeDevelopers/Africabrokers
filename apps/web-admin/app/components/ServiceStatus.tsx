"use client";

import { useEffect, useState } from "react";

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

export function ServiceStatus() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use fetch directly for client-side component
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_CORE_API_BASE_URL || 'http://localhost:4000';
      const url = `${baseUrl}/v1/_status`;
      
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

      // Always send X-Tenant header (required for _status endpoint)
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch service status'));
      // Set default status on error
      setStatus(null);
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

  if (loading && !status) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
        <span>Checking services...</span>
      </div>
    );
  }

  // Calculate overall status from individual services
  const calculateOverallStatus = (): 'healthy' | 'degraded' | 'down' => {
    if (!status?.services) return 'down';
    
    const serviceStatuses = Object.values(status.services);
    if (serviceStatuses.every(s => s.status === 'ok')) return 'healthy';
    if (serviceStatuses.some(s => s.status === 'down')) return 'down';
    return 'degraded';
  };

  const overallStatus = calculateOverallStatus();
  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };

  const statusLabels = {
    ok: 'healthy',
    degraded: 'degraded',
    down: 'down',
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
        <div className={`w-2 h-2 rounded-full ${statusColors[overallStatus]}`}></div>
        <span className="hidden sm:inline">Services</span>
        <span className="text-xs text-gray-500">({overallStatus})</span>
      </button>
      
      {/* Dropdown on hover */}
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Service Status</h3>
          <button
            onClick={fetchStatus}
            className="text-xs text-indigo-600 hover:text-indigo-700"
          >
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error.message}
          </div>
        )}
        
        {status?.services ? (
          <div className="space-y-2">
            {Object.entries(status.services).map(([name, service]) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <span className="text-gray-700 capitalize">{name}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColors[service.status === 'ok' ? 'healthy' : service.status]}`}></div>
                  <span className="text-gray-500 capitalize">{statusLabels[service.status] || service.status}</span>
                  <span className="text-gray-400">({service.latencyMs}ms)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            No service status available
          </div>
        )}
      </div>
    </div>
  );
}

