import { Metadata } from 'next';
import { apiClient } from '@/lib/api-client';

export const metadata: Metadata = {
  title: 'All Tenants | Super Admin | AfriBrok Admin',
  description: 'Manage all tenants in the platform',
};

export const dynamic = 'force-dynamic';

export default async function TenantsPage() {
  let tenants: any[] = [];
  let error: string | null = null;

  try {
    const data = await apiClient.get('/superadmin/tenants', { includeTenant: false });
    tenants = Array.isArray(data) ? data : data.items || [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load tenants.';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Tenants</h1>
        <p className="mt-2 text-gray-600">
          View and manage all tenants across the platform.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  {error ? 'Error loading tenants' : 'No tenants found'}
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {tenant.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tenant.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tenant.country}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tenant.stats ? (
                      <span>
                        {tenant.stats.users || 0} users, {tenant.stats.brokers || 0} brokers, {tenant.stats.listings || 0} listings
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
