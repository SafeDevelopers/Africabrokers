import Link from "next/link";

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Details</h1>
              <p className="text-sm text-gray-500">Moderate user-submitted review and take action</p>
            </div>
            <Link href="/reviews/pending" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to Pending Reviews
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
                <p className="text-sm text-gray-500">Review ID</p>
                <p className="font-medium text-gray-900">{id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Target</p>
                <p className="font-medium text-gray-900">Mock Target Name</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium text-gray-900">⭐ ⭐ ⭐ ⭐ ☆</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">UNDER REVIEW</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900">Content</h3>
              <p className="mt-2 text-sm text-gray-800">
                Placeholder content for the selected review. Use this page to verify the review against platform policies and decide on action.
              </p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Moderation</h3>
              <div className="mt-3 space-y-2">
                <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Approve</button>
                <button className="w-full px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Reject</button>
                <button className="w-full px-3 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700">Flag</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
