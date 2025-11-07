import { Metadata } from 'next';
import { PlatformSettingsClient } from './platform-settings-client';
import { apiRequest } from '@/lib/api-server';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Settings | Super Admin | AfriBrok Admin',
  description: 'Configure platform-wide settings',
};

export const dynamic = 'force-dynamic';

type PlatformSettingsResponse = {
  version: number;
  settings: any;
};

async function fetchPlatformSettings(): Promise<PlatformSettingsResponse | null> {
  try {
    const data = await apiRequest<{ version: number; settings: any }>(
      '/v1/super/platform-settings',
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch platform settings:', error);
    return null;
  }
}

async function checkTenantOverrides() {
  try {
    // This would check if any tenants have overrides
    // For now, return false as placeholder - actual implementation would query API
    // In production, this would call: GET /v1/super/tenants?hasOverrides=true
    return false;
  } catch (error) {
    return false;
  }
}

export default async function PlatformSettingsPage() {
  const data = await fetchPlatformSettings();
  const hasTenantOverrides = data ? await checkTenantOverrides() : false;

  return (
    <>
      {hasTenantOverrides && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Tenant Overrides Present
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Some tenants have overridden platform settings. 
                <Link 
                  href="/super/tenants" 
                  className="ml-1 underline hover:text-yellow-900"
                >
                  View tenant policies
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
      {data ? (
        <PlatformSettingsClient initialSettings={data.settings} version={data.version} />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600 shadow-sm">
          <p className="font-medium text-gray-900">Platform settings API unavailable</p>
          <p className="mt-2">
            No fallback configuration is loaded. Ensure <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-700">/v1/super/platform-settings</code> is implemented
            and reachable before updating global policies.
          </p>
        </div>
      )}
    </>
  );
}
