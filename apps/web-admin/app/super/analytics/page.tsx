import { Metadata } from 'next';
import { apiClient } from '@/lib/api-client';

export const metadata: Metadata = {
  title: 'System Analytics | Super Admin | AfriBrok Admin',
  description: 'Platform-wide analytics and insights',
};

export const dynamic = 'force-dynamic';

export default async function SystemAnalyticsPage() {
  let overview: any = null;
  let error: string | null = null;

  try {
    overview = await apiClient.get('/superadmin/overview', { includeTenant: false });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load analytics.';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
        <p className="mt-2 text-gray-600">
          Platform-wide analytics and insights across all tenants.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {overview && (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{overview.tenants?.total || 0}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{overview.users?.total || 0}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Total Brokers</p>
              <p className="text-2xl font-bold text-gray-900">{overview.brokers?.total || 0}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{overview.listings?.total || 0}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Pending Agent Applications</p>
              <p className="text-2xl font-bold text-gray-900">{overview.agentApplications?.pending || 0}</p>
            </div>
          </div>
        </section>
      )}

      {!overview && !error && (
        <section className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">No items</p>
          <p className="text-sm text-gray-600 mt-2">
            No analytics data available at this time.
          </p>
        </section>
      )}
    </div>
  );
}
