import { Metadata } from 'next';
import { apiClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Super Admin Dashboard | AfriBrok Admin',
  description: 'Super admin dashboard for managing all tenants and agent applications',
};

const quickLinks = [
    {
      href: '/super/agents',
      icon: '📋',
      title: 'Review Agent Applications',
      subtitle: 'Approve or reject pending submissions',
    },
    {
      href: '/super/tenants',
      icon: '🏢',
      title: 'Manage Tenants',
      subtitle: 'Lifecycle, branding, and quotas',
    },
    {
      href: '/super/settings',
      icon: '⚙️',
      title: 'Platform Settings',
      subtitle: 'Global defaults, rate limits, theming',
    },
    {
      href: '/super/analytics',
      icon: '📊',
      title: 'System Analytics',
      subtitle: 'Usage, errors, growth trends',
    },
  ];

export default async function SuperAdminDashboard() {
  let overview: any = null;
  let error: string | null = null;

  try {
    overview = await apiClient.get('/superadmin/overview', { includeTenant: false });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load overview.';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor cross-tenant activity, respond to pending approvals, and keep the platform healthy.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {overview && (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{overview.tenants?.total || 0}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-2xl font-bold text-gray-900">{overview.users?.total || 0}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Brokers</p>
              <p className="text-2xl font-bold text-gray-900">{overview.brokers?.total || 0}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Listings</p>
              <p className="text-2xl font-bold text-gray-900">{overview.listings?.total || 0}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Pending Agent Applications</p>
              <p className="text-2xl font-bold text-gray-900">{overview.agentApplications?.pending || 0}</p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600">{item.icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
