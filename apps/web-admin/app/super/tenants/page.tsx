import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Tenants | Super Admin | AfriBrok Admin',
  description: 'Manage all tenants in the platform',
};

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Tenants</h1>
        <p className="mt-2 text-gray-600">
          View and manage all tenants across the platform.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Tenant management interface coming soon...</p>
      </div>
    </div>
  );
}

