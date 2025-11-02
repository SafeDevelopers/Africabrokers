"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalBrokers: 156,
    activeBrokers: 142,
    totalListings: 2847,
    activeListings: 2156,
    totalUsers: 8924,
    activeUsers: 5632,
    totalTransactions: 1247,
    totalRevenue: 2850000
  },
  brokerMetrics: {
    newBrokers: 12,
    pendingApplications: 8,
    averageRating: 4.3,
    topPerformingBrokers: [
      {
        id: "broker-1",
        name: "Tadesse Real Estate",
        listings: 45,
        transactions: 23,
        rating: 4.8
      },
      {
        id: "broker-2", 
        name: "Prime Properties Ltd",
        listings: 38,
        transactions: 19,
        rating: 4.6
      },
      {
        id: "broker-3",
        name: "Elite Homes",
        listings: 42,
        transactions: 18,
        rating: 4.7
      }
    ]
  },
  listingMetrics: {
    newListings: 34,
    pendingListings: 12,
    averagePrice: 485000,
    averageTimeToSell: 45,
    mostPopularAreas: [
      {
        area: "Bole",
        count: 287,
        averagePrice: 650000
      },
      {
        area: "Kirkos",
        count: 234,
        averagePrice: 420000
      },
      {
        area: "Yeka",
        count: 198,
        averagePrice: 380000
      }
    ]
  },
  userMetrics: {
    newUsers: 156,
    activeUsers: 5632,
    searchQueries: 12847,
    averageSessionTime: 8.5
  },
  financialMetrics: {
    totalRevenue: 2850000,
    commission: 2280000,
    subscriptionRevenue: 570000,
    monthlyGrowth: 12.5
  }
};

export default function AnalyticsReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("30d");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setData(mockAnalyticsData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
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
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="mt-8 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return <div>Error loading analytics data</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-sm text-gray-500">
                Platform performance metrics, business intelligence, and insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                onClick={() => alert("Export analytics report dialog (mock)")}
              >
                📥 Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-8">
          {/* Overview Metrics */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="Total Brokers"
                value={formatNumber(data.overview.totalBrokers)}
                subtitle={`${data.overview.activeBrokers} active`}
                icon="👥"
                color="blue"
              />
              <MetricCard
                title="Total Listings"
                value={formatNumber(data.overview.totalListings)}
                subtitle={`${data.overview.activeListings} active`}
                icon="🏠"
                color="green"
              />
              <MetricCard
                title="Total Users"
                value={formatNumber(data.overview.totalUsers)}
                subtitle={`${data.overview.activeUsers} active`}
                icon="👤"
                color="purple"
              />
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(data.overview.totalRevenue)}
                subtitle={`${data.overview.totalTransactions} transactions`}
                icon="💰"
                color="yellow"
              />
            </div>
          </section>

          {/* Broker Analytics */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Broker Performance</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Broker Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Brokers (30 days)</span>
                    <span className="font-semibold">{data.brokerMetrics.newBrokers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Applications</span>
                    <span className="font-semibold text-orange-600">{data.brokerMetrics.pendingApplications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold">⭐ {data.brokerMetrics.averageRating}/5</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Top Performing Brokers</h3>
                <div className="space-y-3">
                  {data.brokerMetrics.topPerformingBrokers.map((broker, index) => (
                    <div key={broker.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1} {broker.name}
                        </span>
                        <div className="text-xs text-gray-500">
                          {broker.listings} listings • {broker.transactions} transactions
                        </div>
                      </div>
                      <span className="text-sm font-semibold">⭐ {broker.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Listing Analytics */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Listing Performance</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Listing Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Listings (30 days)</span>
                    <span className="font-semibold">{data.listingMetrics.newListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Review</span>
                    <span className="font-semibold text-orange-600">{data.listingMetrics.pendingListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Price</span>
                    <span className="font-semibold">{formatCurrency(data.listingMetrics.averagePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Time to Sell</span>
                    <span className="font-semibold">{data.listingMetrics.averageTimeToSell} days</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Popular Areas</h3>
                <div className="space-y-3">
                  {data.listingMetrics.mostPopularAreas.map((area, index) => (
                    <div key={area.area} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1} {area.area}
                        </span>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(area.averagePrice)} avg price
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{area.count} listings</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* User Analytics */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="New Users"
                value={formatNumber(data.userMetrics.newUsers)}
                subtitle="Last 30 days"
                icon="👥"
                color="blue"
              />
              <MetricCard
                title="Active Users"
                value={formatNumber(data.userMetrics.activeUsers)}
                subtitle="Monthly active"
                icon="🔥"
                color="green"
              />
              <MetricCard
                title="Search Queries"
                value={formatNumber(data.userMetrics.searchQueries)}
                subtitle="This month"
                icon="🔍"
                color="purple"
              />
              <MetricCard
                title="Avg Session Time"
                value={`${data.userMetrics.averageSessionTime}m`}
                subtitle="Per user"
                icon="⏱️"
                color="orange"
              />
            </div>
          </section>

          {/* Financial Analytics */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Performance</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.financialMetrics.totalRevenue)}</p>
                  <p className="text-sm text-green-600">+{data.financialMetrics.monthlyGrowth}% from last month</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Commission Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.financialMetrics.commission)}</p>
                  <p className="text-sm text-gray-500">{((data.financialMetrics.commission / data.financialMetrics.totalRevenue) * 100).toFixed(1)}% of total</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subscription Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.financialMetrics.subscriptionRevenue)}</p>
                  <p className="text-sm text-gray-500">{((data.financialMetrics.subscriptionRevenue / data.financialMetrics.totalRevenue) * 100).toFixed(1)}% of total</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-bold text-green-600">+{data.financialMetrics.monthlyGrowth}%</p>
                  <p className="text-sm text-gray-500">Revenue growth rate</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => alert("Generate detailed broker report (mock)")}
                className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50"
              >
                <div className="text-lg mb-2">📊</div>
                <div className="font-semibold text-gray-900">Broker Performance Report</div>
                <div className="text-sm text-gray-500">Detailed analysis of broker metrics</div>
              </button>
              
              <button
                onClick={() => alert("Generate financial report (mock)")}
                className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50"
              >
                <div className="text-lg mb-2">💰</div>
                <div className="font-semibold text-gray-900">Financial Report</div>
                <div className="text-sm text-gray-500">Revenue and transaction analysis</div>
              </button>
              
              <button
                onClick={() => alert("Generate user engagement report (mock)")}
                className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50"
              >
                <div className="text-lg mb-2">👥</div>
                <div className="font-semibold text-gray-900">User Engagement Report</div>
                <div className="text-sm text-gray-500">User behavior and engagement metrics</div>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: string; 
  color: string; 
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    yellow: "bg-yellow-50 border-yellow-200",
    orange: "bg-orange-50 border-orange-200"
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}