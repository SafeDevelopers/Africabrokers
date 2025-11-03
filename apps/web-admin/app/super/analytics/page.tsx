import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Analytics | Super Admin | AfriBrok Admin',
  description: 'Platform-wide analytics and insights',
};

export default function SystemAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
        <p className="mt-2 text-gray-600">
          View platform-wide analytics and insights across all tenants.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">System analytics interface coming soon...</p>
      </div>
    </div>
  );
}

