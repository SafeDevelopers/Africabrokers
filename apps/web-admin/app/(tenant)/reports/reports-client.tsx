"use client";

import { useState } from "react";
import {
  Users,
  Building2,
  User,
  DollarSign,
  TrendingUp,
  Star,
  AlertCircle,
  Clock,
  MapPin,
  Download,
  Calendar,
  BarChart3,
  Eye,
} from "lucide-react";

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

type ReportsClientProps = {
  initialData: AnalyticsData;
};

export function ReportsClient({ initialData }: ReportsClientProps) {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const data = initialData;

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
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
              <p className="text-sm text-gray-600">
                Platform performance metrics, business intelligence, and insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm font-medium text-gray-700 appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
              <button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                onClick={() => alert("Export analytics report dialog (mock)")}
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Brokers"
                value={formatNumber(data.overview.totalBrokers)}
                subtitle={`${data.overview.activeBrokers} active`}
                icon={<Users className="w-6 h-6" />}
                gradient="from-blue-500 to-cyan-500"
                bgColor="bg-blue-50"
                borderColor="border-blue-200"
              />
              <MetricCard
                title="Total Listings"
                value={formatNumber(data.overview.totalListings)}
                subtitle={`${data.overview.activeListings} active`}
                icon={<Building2 className="w-6 h-6" />}
                gradient="from-green-500 to-emerald-500"
                bgColor="bg-green-50"
                borderColor="border-green-200"
              />
              <MetricCard
                title="Total Users"
                value={formatNumber(data.overview.totalUsers)}
                subtitle={`${data.overview.activeUsers} active`}
                icon={<User className="w-6 h-6" />}
                gradient="from-purple-500 to-pink-500"
                bgColor="bg-purple-50"
                borderColor="border-purple-200"
              />
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(data.overview.totalRevenue)}
                subtitle={`${data.overview.totalTransactions} transactions`}
                icon={<DollarSign className="w-6 h-6" />}
                gradient="from-amber-500 to-orange-500"
                bgColor="bg-amber-50"
                borderColor="border-amber-200"
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Broker Performance</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Broker Metrics</h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">New Brokers (30 days)</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{data.brokerMetrics.newBrokers}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Pending Applications</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{data.brokerMetrics.pendingApplications}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-600 fill-yellow-400" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Average Rating</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span>{data.brokerMetrics.averageRating}/5</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Brokers</h3>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {data.brokerMetrics.topPerformingBrokers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No broker data available</p>
                  ) : (
                    data.brokerMetrics.topPerformingBrokers.map((broker, index) => (
                      <div key={broker.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                            'bg-gradient-to-r from-amber-600 to-orange-600'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900 block">{broker.name}</span>
                            <span className="text-xs text-gray-500">{broker.listings} listings • {broker.transactions} transactions</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900">{broker.rating}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Listing Performance</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Listing Metrics</h3>
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">New Listings (30 days)</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{data.listingMetrics.newListings}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Pending Review</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{data.listingMetrics.pendingListings}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Average Price</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(data.listingMetrics.averagePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Avg. Time to Sell</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{data.listingMetrics.averageTimeToSell} days</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Popular Areas</h3>
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {data.listingMetrics.mostPopularAreas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No area data available</p>
                  ) : (
                    data.listingMetrics.mostPopularAreas.map((area, index) => (
                      <div key={area.area} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            index === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900 block">{area.area}</span>
                            <span className="text-xs text-gray-500">{formatCurrency(area.averagePrice)} avg price</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{area.count} listings</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Engagement</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="grid gap-6 md:grid-cols-4">
                <MetricCard
                  title="New Users"
                  value={formatNumber(data.userMetrics.newUsers)}
                  subtitle="Last 30 days"
                  icon={<Users className="w-6 h-6" />}
                  gradient="from-blue-500 to-cyan-500"
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                />
                <MetricCard
                  title="Active Users"
                  value={formatNumber(data.userMetrics.activeUsers)}
                  subtitle="Monthly active"
                  icon={<TrendingUp className="w-6 h-6" />}
                  gradient="from-green-500 to-emerald-500"
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                />
                <MetricCard
                  title="Search Queries"
                  value={formatNumber(data.userMetrics.searchQueries)}
                  subtitle="This month"
                  icon={<Eye className="w-6 h-6" />}
                  gradient="from-purple-500 to-pink-500"
                  bgColor="bg-purple-50"
                  borderColor="border-purple-200"
                />
                <MetricCard
                  title="Avg Session Time"
                  value={`${data.userMetrics.averageSessionTime}m`}
                  subtitle="Per user"
                  icon={<Clock className="w-6 h-6" />}
                  gradient="from-amber-500 to-orange-500"
                  bgColor="bg-amber-50"
                  borderColor="border-amber-200"
                />
              </div>
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
  gradient,
  bgColor,
  borderColor
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`p-6 rounded-xl border-2 ${borderColor} ${bgColor} hover:shadow-lg transition-all duration-200 group cursor-pointer`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

