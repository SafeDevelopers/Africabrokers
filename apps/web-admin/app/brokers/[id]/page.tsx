import Link from "next/link";

export default function BrokerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Broker Details</h1>
              <p className="text-sm text-gray-500">Review KYC, status, QR code, and activity</p>
            </div>
            <Link href="/brokers" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to Brokers
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Broker ID</p>
                <p className="font-medium text-gray-900">{id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium text-gray-900">Mock Business Name</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Number</p>
                <p className="font-medium text-gray-900">ETH-XX-2024-XYZ</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">APPROVED</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900">Documents</h3>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                <li>Business license document</li>
                <li>Tax ID / TIN</li>
                <li>National ID</li>
                <li>Selfie verification</li>
              </ul>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
              <div className="mt-3 space-y-2">
                <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Approve</button>
                <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700">Request Docs</button>
                <button className="w-full px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Suspend</button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">QR Code</h3>
              <div className="mt-3 bg-gray-100 rounded-lg p-4 text-center">
                <div className="w-24 h-24 bg-gray-300 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-4xl">📱</span>
                </div>
                <Link href={`/qr-codes/${id}`} className="text-sm text-indigo-600 hover:text-indigo-700">
                  View QR details →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
