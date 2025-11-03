import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Settings | Super Admin | AfriBrok Admin',
  description: 'Configure platform-wide settings',
};

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure platform-wide settings and policies.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Platform settings interface coming soon...</p>
      </div>
    </div>
  );
}

