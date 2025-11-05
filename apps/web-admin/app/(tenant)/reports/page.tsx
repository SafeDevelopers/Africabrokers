import { Suspense } from "react";
import { apiRequest } from "../../../lib/api-server";
import { ReportsClient } from "./reports-client";

interface AnalyticsData {
  overview: {
    totalBrokers: number;
    activeBrokers: number;
    totalListings: number;
    activeListings: number;
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalRevenue: number;
  };
  brokerMetrics: {
    newBrokers: number;
    pendingApplications: number;
    averageRating: number;
    topPerformingBrokers: {
      id: string;
      name: string;
      listings: number;
      transactions: number;
      rating: number;
    }[];
  };
  listingMetrics: {
    newListings: number;
    pendingListings: number;
    averagePrice: number;
    averageTimeToSell: number;
    mostPopularAreas: {
      area: string;
      count: number;
      averagePrice: number;
    }[];
  };
  userMetrics: {
    newUsers: number;
    activeUsers: number;
    searchQueries: number;
    averageSessionTime: number;
  };
  financialMetrics: {
    totalRevenue: number;
    commission: number;
    subscriptionRevenue: number;
    monthlyGrowth: number;
  };
}

async function fetchAnalyticsData(): Promise<AnalyticsData> {
  try {
    // TODO: Replace with actual admin analytics endpoint when available
    // For now, using placeholder endpoint that may return 404
    const data = await apiRequest<AnalyticsData>('/v1/admin/analytics');
    return data;
  } catch (error) {
    // If endpoint doesn't exist yet, return empty structure
    console.error('Error fetching analytics:', error);
    return {
      overview: {
        totalBrokers: 0,
        activeBrokers: 0,
        totalListings: 0,
        activeListings: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalTransactions: 0,
        totalRevenue: 0,
      },
      brokerMetrics: {
        newBrokers: 0,
        pendingApplications: 0,
        averageRating: 0,
        topPerformingBrokers: [],
      },
      listingMetrics: {
        newListings: 0,
        pendingListings: 0,
        averagePrice: 0,
        averageTimeToSell: 0,
        mostPopularAreas: [],
      },
      userMetrics: {
        newUsers: 0,
        activeUsers: 0,
        searchQueries: 0,
        averageSessionTime: 0,
      },
      financialMetrics: {
        totalRevenue: 0,
        commission: 0,
        subscriptionRevenue: 0,
        monthlyGrowth: 0,
      },
    };
  }
}

async function ReportsContent() {
  try {
    const data = await fetchAnalyticsData();
    return <ReportsClient initialData={data} />;
  } catch (error) {
    return <ErrorDisplay error={error} />;
  }
}

function ErrorDisplay({ error }: { error: unknown }) {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
          <p className="text-sm text-gray-600">Platform performance metrics, business intelligence, and insights</p>
        </div>
      </header>
      <main className="px-8 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-xl font-semibold text-red-900">Failed to load analytics</h2>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching analytics data."}
              </p>
              <a
                href="/reports"
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

export default function AnalyticsReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 min-h-full">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </header>
          <main className="px-8 py-8">
            <div className="grid gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </main>
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
