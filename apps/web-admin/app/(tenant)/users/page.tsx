import { Suspense } from "react";
import { apiRequest } from "../../../lib/api-server";
import { UsersClient } from "./users-client";

interface User {
  id: string;
  tenantId: string;
  authProviderId: string;
  role: 'admin' | 'broker' | 'inspector' | 'individual_seller' | 'public_viewer';
  phoneHash?: string;
  emailHash?: string;
  kycStatus?: string;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status: 'active' | 'suspended' | 'pending_verification';
  broker?: {
    id: string;
    status: string;
    licenseDocs: {
      businessName: string;
    };
  };
}

async function fetchUsers(): Promise<User[]> {
  try {
    const data = await apiRequest<{ users: any[] }>('/v1/admin/users?limit=100');
    return transformApiUsers(data.users || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

function transformApiUsers(apiUsers: any[]): User[] {
  return apiUsers.map((u: any) => ({
    id: u.id,
    tenantId: u.tenantId || '',
    authProviderId: u.authProviderId || u.email || '',
    role: u.role || 'public_viewer',
    phoneHash: u.phoneHash,
    emailHash: u.emailHash,
    kycStatus: u.kycStatus,
    mfaEnabled: u.mfaEnabled || false,
    createdAt: u.createdAt || new Date().toISOString(),
    updatedAt: u.updatedAt || new Date().toISOString(),
    lastLogin: u.lastLogin,
    status: u.status || 'active',
    broker: u.broker ? {
      id: u.broker.id,
      status: u.broker.status || 'submitted',
      licenseDocs: {
        businessName: (u.broker.licenseDocs as any)?.businessName || 'Unknown'
      }
    } : undefined
  }));
}

async function UsersContent() {
  try {
    const users = await fetchUsers();
    return <UsersClient initialUsers={users} />;
  } catch (error) {
    return <ErrorDisplay error={error} />;
  }
}

function ErrorDisplay({ error }: { error: unknown }) {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage user accounts, roles, and platform access</p>
        </div>
      </header>
      <main className="px-6 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-xl font-semibold text-red-900">Failed to load users</h2>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching users."}
              </p>
              <a
                href="/users"
                className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Try again
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 min-h-full">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </header>
          <main className="px-6 py-8">
            <div className="space-y-6 animate-pulse">
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </main>
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
