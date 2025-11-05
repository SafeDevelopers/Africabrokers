import { Metadata } from 'next';
import { PlatformSettingsClient } from './platform-settings-client';
import { apiRequest } from '@/lib/api-server';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Settings | Super Admin | AfriBrok Admin',
  description: 'Configure platform-wide settings',
};

async function fetchPlatformSettings() {
  try {
    const data = await apiRequest<{ version: number; settings: any }>(
      '/v1/super/platform-settings',
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch platform settings:', error);
    // Return defaults if fetch fails
    return {
      version: 1,
      settings: {
        branding: {
          siteName: 'AfriBrok',
          theme: 'light',
        },
        localization: {
          defaultLocale: 'en-ET',
          supportedLocales: ['en-ET', 'am-ET'],
          currency: 'ETB',
          timezone: 'Africa/Addis_Ababa',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
        },
        security: {
          require2FA: false,
          sessionTimeout: 60,
          passwordMinLength: 8,
          passwordRequireUppercase: true,
          passwordRequireLowercase: true,
          passwordRequireNumbers: true,
          passwordRequireSpecialChars: false,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
        },
        tenancy: {
          allowMultiTenant: true,
          tenantIsolationLevel: 'strict',
        },
        marketplace: {
          enableSellPageLeads: false,
          enablePublicListings: true,
          requireBrokerVerification: true,
          listingApprovalRequired: true,
        },
        payments: {
          supportedCurrencies: ['ETB', 'USD'],
          enableSubscriptions: true,
          enableInvoicing: true,
        },
        integrations: {
          analyticsEnabled: true,
        },
        observability: {
          enableLogging: true,
          logLevel: 'info',
          enableMetrics: true,
          enableTracing: false,
        },
        legal: {
          gdprCompliant: false,
        },
      },
    };
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
  const { version, settings } = await fetchPlatformSettings();
  const hasTenantOverrides = await checkTenantOverrides();

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
      <PlatformSettingsClient initialSettings={settings} version={version} />
    </>
  );
}

