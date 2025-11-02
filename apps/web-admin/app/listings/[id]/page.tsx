import Link from "next/link";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Listing Details</h1>
              <p className="text-sm text-gray-500">Moderate, approve, and manage listing</p>
            </div>
            <Link href="/listings" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to Listings
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
                <p className="text-sm text-gray-500">Listing ID</p>
                <p className="font-medium text-gray-900">{id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium text-gray-900">Mock Listing Title</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">PENDING</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Broker</p>
                <Link href={`/brokers/mock-broker`} className="text-indigo-600 hover:text-indigo-700 text-sm">Tadesse Real Estate</Link>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900">Content</h3>
              <div className="mt-2 h-40 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                Photo/video gallery preview here
              </div>
              <p className="mt-3 text-sm text-gray-700">
                Placeholder description for the listing. Use this page to review the content and decide whether to approve, request changes, or reject.
              </p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Moderation</h3>
              <div className="mt-3 space-y-2">
                <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Approve</button>
                <button className="w-full px-3 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700">Request Changes</button>
                <button className="w-full px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Reject</button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Engagement</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Views</p>
                  <p className="font-semibold">—</p>
                </div>
                <div>
                  <p className="text-gray-500">Inquiries</p>
                  <p className="font-semibold">—</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
