import { Metadata } from 'next';
import { apiClient } from '../../../lib/api-client';

export const metadata: Metadata = {
  title: 'Agent Applications | Super Admin | AfriBrok Admin',
  description: 'Review and manage agent applications from all tenants',
};

export const dynamic = 'force-dynamic';

export default async function AgentApplicationsPage() {
  let applications: any[] = [];
  let error: string | null = null;

  try {
    const data = await apiClient.get('/superadmin/agents', { includeTenant: false });
    applications = Array.isArray(data) ? data : data.items || [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load agent applications.';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agent Applications</h1>
        <p className="mt-2 text-gray-600">
          Review and approve agent applications from all tenants. This view reflects live API data only.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Application ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {applications.map((app: any) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {app.id?.slice(0, 12) || app.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {app.tenant?.name || app.tenantId || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {app.user?.email || app.userId || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : app.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-700'
                            : app.status === 'NEEDS_INFO'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {app.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {app.submittedAt ? new Date(app.submittedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <a href={`/super/agents/${app.id}`} className="text-indigo-600 hover:text-indigo-900">
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {!applications.length && !error && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No agent applications were returned by the API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
