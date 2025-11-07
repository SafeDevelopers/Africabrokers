import Link from "next/link";
import { Suspense } from "react";
import { apiRequest } from "@/lib/api-server";
import { formatDateTime, getBrokerStatusColor, getBrokerStatusLabel } from "@afribrok/lib";

type Broker = {
  id: string;
  tenantId: string;
  userId: string;
  licenseNumber: string;
  licenseDocs: Record<string, unknown> | null;
  businessDocs: Record<string, unknown> | null;
  status: string;
  rating: number | null;
  strikeCount: number;
  submittedAt: string | null;
  approvedAt: string | null;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
  qrCode: {
    id: string;
    status: string;
  } | null;
  listingCount: number;
};

type BrokersResponse = {
  items: Broker[];
  total: number;
  limit: number;
  offset: number;
};

async function getBrokers(): Promise<BrokersResponse> {
  try {
    const response = await api.get<BrokersResponse>("/admin/brokers?limit=100");
    return response;
  } catch (error) {
    // Re-throw ApiError to be handled by the component
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch brokers", "UNKNOWN_ERROR", 0);
  }
}

const statusStyles: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
};

async function BrokersContent() {
  let data: BrokersResponse | null = null;
  let error: ApiError | null = null;
  
  try {
    data = await getBrokers();
  } catch (err) {
    error = err instanceof ApiError ? err : new ApiError("Failed to load brokers", "UNKNOWN_ERROR", 0);
  }
  
  if (error) {
    return (
      <div className="px-6 py-8">
        <ErrorBanner error={error} route="/v1/admin/brokers" onRetry={() => window.location.reload()} />
      </div>
    );
  }
  
  const brokers = data?.items || [];
  
  if (brokers.length === 0) {

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Brokers</h1>
              <p className="text-sm text-gray-500">Directory of verified brokers under this regulator.</p>
            </div>
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        {brokers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-xl font-semibold text-gray-900 mb-2">No brokers found</p>
              <p className="text-sm text-gray-600">
                No brokers have been registered yet. Brokers will appear here once they complete their registration.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Showing {brokers.length} of {data.total} brokers
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brokers.map((broker) => {
                    const statusColor = getBrokerStatusColor(broker.status);
                    const statusLabel = getBrokerStatusLabel(broker.status);
                    const businessName = (broker.licenseDocs as any)?.businessName || broker.user.email;

                    return (
                      <tr key={broker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{businessName}</div>
                            <div className="text-sm text-gray-500">{broker.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{broker.licenseNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusStyles[statusColor] || statusStyles.gray
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {broker.rating !== null ? `${broker.rating.toFixed(1)} ⭐` : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{broker.listingCount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {broker.submittedAt ? formatDateTime(broker.submittedAt) : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/brokers/${broker.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}

export default async function BrokersPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Broker Management</h1>
              <p className="text-sm text-gray-500">View and manage all registered brokers</p>
            </div>
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
        <BrokersContent />
      </Suspense>
    </div>
  );
}
