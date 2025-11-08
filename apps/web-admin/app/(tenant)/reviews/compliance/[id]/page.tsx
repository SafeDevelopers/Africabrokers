import Link from "next/link";

export default function ComplianceReportDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compliance Report</h1>
              <p className="text-sm text-gray-500">Detailed compliance report information</p>
            </div>
            <Link href="/reviews/compliance" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to Compliance
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Report Overview</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Report ID</p>
                <p className="font-medium text-gray-900">{id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium text-gray-900">Report type not provided</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">GENERATED</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Generated At</p>
                <p className="font-medium text-gray-900">—</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900">Summary</h3>
              <p className="mt-2 text-sm text-gray-600">
                No summary available. Data will be loaded from the API.
              </p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
              <div className="mt-3 space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Download PDF</button>
                <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Approve</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
