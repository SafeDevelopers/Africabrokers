import { Suspense } from "react";
import { api, ApiError } from "@/lib/api";
import { ErrorBanner } from "@/app/components/ErrorBanner";
import Link from "next/link";

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

async function fetchActivities(): Promise<Activity[]> {
  try {
    const response = await api.get<{ items: Activity[] }>("/admin/activity");
    return response.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch activities", "UNKNOWN_ERROR", 0);
  }
}

async function ActivityContent() {
  let activities: Activity[] = [];
  let error: ApiError | null = null;
  
  try {
    activities = await fetchActivities();
  } catch (err) {
    error = err instanceof ApiError ? err : new ApiError("Failed to load activities", "UNKNOWN_ERROR", 0);
  }
  
  if (error) {
    return (
      <div className="px-6 py-8">
        <ErrorBanner error={error} route="/v1/admin/activity" onRetry={() => window.location.reload()} />
        <Link href="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          Back to admin homepage →
        </Link>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">No items</p>
          <p className="text-sm text-gray-600 mt-2">There are no activities at this time.</p>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Back to admin homepage →
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Activity Feed ({activities.length})</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">Activity feed implementation coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-sm text-gray-500">Audit events, approvals, and automated notifications.</p>
        </div>
      </header>
      <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
        <ActivityContent />
      </Suspense>
    </div>
  );
}
