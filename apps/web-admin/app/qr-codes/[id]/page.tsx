import Link from "next/link";

export default function QRDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Code Details</h1>
              <p className="text-sm text-gray-500">Manage broker verification QR code</p>
            </div>
            <Link href="/qr-codes" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to QR Codes
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
                <p className="text-sm text-gray-500">QR ID</p>
                <p className="font-medium text-gray-900">{id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">ACTIVE</span>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Preview</p>
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-6 flex items-center justify-center h-48">
                  <span className="text-6xl">📱</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
              <div className="mt-3 space-y-2">
                <button className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">Download SVG</button>
                <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Activate</button>
                <button className="w-full px-3 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700">Suspend</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
