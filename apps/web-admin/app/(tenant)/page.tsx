import Link from "next/link";
import { apiRequest } from "@/lib/api-server";

type DashboardStats = {
  pendingBrokers: number;
  activeBrokers: number;
  totalListings: number;
  pendingReviews: number;
  monthlyRevenue: number;
  activeUsers: number;
  completedTransactions: number;
  averageResponseTime: number | null;
};

type RecentActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    role: string;
  } | null;
  summary: string;
};

type DashboardResponse = {
  generatedAt: string;
  stats: DashboardStats;
  recentActivity: RecentActivity[];
};

const formatNumber = (value?: number | null) =>
  typeof value === "number" && !Number.isNaN(value) ? value.toLocaleString() : "—";

const formatCurrency = (value?: number | null, currency: string = "ETB") => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

async function fetchDashboard(): Promise<DashboardResponse | null> {
  try {
    return await apiRequest<DashboardResponse>("/v1/admin/dashboard");
  } catch (error) {
    console.error("Failed to load tenant dashboard metrics", error);
    return null;
  }
}

export default async function DashboardLanding() {
  const dashboard = await fetchDashboard();
  const stats = dashboard?.stats;
  const recentActivity = dashboard?.recentActivity ?? [];

  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard Overview</h1>
              <p className="text-xs text-gray-500 sm:text-sm">Ethiopia Property Management Platform</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-gray-900">Welcome back!</p>
              <p className="text-xs text-gray-500">{currentTime}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-2 sm:text-3xl">Welcome to AfriBrok Admin</h2>
                <p className="text-blue-100 text-base sm:text-lg">
                  Manage broker verifications, property listings, and platform operations
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-blue-100">
                  <span className="flex items-center text-sm sm:text-base">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    System Status: Online
                  </span>
                  <span className="flex items-center text-sm sm:text-base">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Database: Connected
                  </span>
                </div>
              </div>
              <div className="hidden lg:block flex-shrink-0 ml-4">
                <div className="text-6xl opacity-20">🏢</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Pending Brokers"
              value={formatNumber(stats?.pendingBrokers)}
              change="Awaiting review"
              changeType="increase"
              description="Awaiting review"
              href="/brokers/pending"
              icon="👥"
              gradient="from-orange-400 to-red-500"
            />
            <MetricCard
              title="Active Brokers"
              value={formatNumber(stats?.activeBrokers)}
              change="Approved"
              changeType="increase"
              description="Verified & active"
              href="/brokers"
              icon="✅"
              gradient="from-green-400 to-emerald-500"
            />
            <MetricCard
              title="Property Listings"
              value={formatNumber(stats?.totalListings)}
              change="In review"
              changeType="increase"
              description="Total on platform"
              href="/listings"
              icon="🏠"
              gradient="from-blue-400 to-cyan-500"
            />
            <MetricCard
              title="Monthly Revenue"
              value={formatCurrency(stats?.monthlyRevenue)}
              change="Paid invoices"
              changeType="increase"
              description="Platform earnings"
              href="/reports"
              icon="💰"
              gradient="from-purple-400 to-pink-500"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <ActionCard
                    title="Review KYC Applications"
                    description="Process pending broker verifications"
                    href="/brokers/pending"
                    icon="📋"
                    badge={stats && stats.pendingBrokers > 0 ? stats.pendingBrokers.toString() : undefined}
                    priority="high"
                  />
                  <ActionCard
                    title="Generate QR Codes"
                    description="Create verification codes for brokers"
                    href="/qr-codes"
                    icon="📱"
                    priority="medium"
                  />
                  <ActionCard
                    title="Property Moderation"
                    description="Review and approve listings"
                    href="/listings"
                    icon="🏠"
                    badge={stats && stats.pendingReviews > 0 ? stats.pendingReviews.toString() : undefined}
                    priority="medium"
                  />
                  <ActionCard
                    title="Platform Analytics"
                    description="View performance metrics"
                    href="/reports"
                    icon="📊"
                    priority="low"
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.length ? (
                  recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    No recent activity recorded for this tenant yet. Actions taken through the platform will appear here once audit logging captures them.
                  </p>
                )}
              </div>
              <Link 
                href="/activity" 
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all activity →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  description: string;
  href: string;
  icon: string;
  gradient: string;
};

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  priority: 'high' | 'medium' | 'low';
};

function MetricCard({ title, value, change, changeType, description, href, icon, gradient }: MetricCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? '↗' : '↘'} {change}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white text-xl`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActionCard({ title, description, href, icon, badge, priority }: ActionCardProps) {
  const priorityColors = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-yellow-500 bg-yellow-50', 
    low: 'border-l-green-500 bg-green-50'
  };

  return (
    <Link href={href} className="block">
      <div className={`border-l-4 ${priorityColors[priority]} rounded-r-xl p-4 hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {badge && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const activityTimestamp = new Date(activity.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start space-x-3">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs text-indigo-600">
        ⓘ
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.summary}</p>
        <p className="text-xs text-gray-500 mt-1">
          {activity.actor?.email ?? 'System'} &middot; {activityTimestamp}
        </p>
      </div>
    </div>
  );
}
