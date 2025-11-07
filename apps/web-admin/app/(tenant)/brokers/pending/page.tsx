import Link from "next/link";
import { apiRequest } from "@/lib/api-server";
import { formatDateTime, getBrokerStatusColor, getBrokerStatusLabel } from "@afribrok/lib";

type Broker = {
  id: string;
  licenseNumber: string;
  licenseDocs: Record<string, unknown> | null;
  status: string;
  submittedAt: string | null;
  user: {
    id: string;
    email: string;
  };
};

type BrokersResponse = {
  items: Broker[];
  total: number;
};

async function getPendingBrokers(): Promise<BrokersResponse> {
  try {
    const allBrokers = await apiRequest<{ items: Broker[]; total: number }>("/v1/admin/brokers?limit=100");
    // Filter for pending/submitted brokers
    const pending = allBrokers.items.filter(b => b.status === 'submitted');
    return {
      items: pending,
      total: pending.length,
    };
  } catch (error) {
    console.error("Error fetching pending brokers:", error);
    if (error instanceof Error && (error as any).isAuthError) {
      console.warn("Authentication error - returning empty results to prevent logout");
    }
    // Return empty results on error - prevents page crash and logout
    return {
      items: [],
      total: 0,
    };
  }
}

const statusStyles: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
};

export default async function PendingBrokersPage() {
  let data: BrokersResponse;
  try {
    data = await getPendingBrokers();
  } catch (error) {
    // If there's an error, show empty state instead of crashing
    console.error("Failed to load pending brokers:", error);
    data = {
      items: [],
      total: 0,
    };
  }
  const brokers = data.items || [];

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Broker Applications</h1>
              <p className="text-sm text-gray-500">Certification requests awaiting regulator review.</p>
            </div>
            <Link
              href="/brokers"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              ← Back to broker directory
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        {brokers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-xl font-semibold text-gray-900 mb-2">No pending applications</p>
              <p className="text-sm text-gray-600">
                All broker applications have been reviewed. New submissions will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {brokers.length} pending application{brokers.length !== 1 ? 's' : ''} awaiting review
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
                            {broker.submittedAt ? formatDateTime(broker.submittedAt) : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/brokers/${broker.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
