"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  pendingBrokers: number;
  activeBrokers: number;
  totalListings: number;
  pendingReviews: number;
  monthlyRevenue: number;
  activeUsers: number;
  completedTransactions: number;
  averageResponseTime: string;
}

interface RecentActivity {
  id: string;
  type: 'broker_applied' | 'listing_created' | 'review_submitted' | 'broker_approved';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export default function DashboardLanding() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingBrokers: 0,
    activeBrokers: 0,
    totalListings: 0,
    pendingReviews: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    completedTransactions: 0,
    averageResponseTime: "0h",
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    setTimeout(() => {
      setStats({
        pendingBrokers: 12,
        activeBrokers: 156,
        totalListings: 1_247,
        pendingReviews: 8,
        monthlyRevenue: 2_450_000,
        activeUsers: 3_240,
        completedTransactions: 892,
        averageResponseTime: "1.2h",
      });
      
      setRecentActivity([
        {
          id: '1',
          type: 'broker_applied',
          message: 'New broker application from Alemayehu Tadesse',
          timestamp: '5 minutes ago',
          status: 'info'
        },
        {
          id: '2', 
          type: 'broker_approved',
          message: 'Sara Mekonnen approved as certified broker',
          timestamp: '1 hour ago',
          status: 'success'
        },
        {
          id: '3',
          type: 'listing_created',
          message: 'New property listing in Bole area - Premium Villa',
          timestamp: '2 hours ago',
          status: 'info'
        },
        {
          id: '4',
          type: 'review_submitted',
          message: 'Review submitted for Dawit Kebede - pending decision',
          timestamp: '3 hours ago',
          status: 'warning'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

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
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-sm text-gray-500">Ethiopia Property Management Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Welcome back!</p>
              <p className="text-xs text-gray-500">{currentTime}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome to AfriBrok Admin</h2>
                <p className="text-blue-100 text-lg">
                  Manage broker verifications, property listings, and platform operations
                </p>
                <div className="mt-4 flex items-center space-x-6 text-blue-100">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    System Status: Online
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Database: Connected
                  </span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="text-6xl opacity-20">🏢</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Pending Brokers"
              value={loading ? "..." : stats.pendingBrokers.toString()}
              change="+3 today"
              changeType="increase"
              description="Awaiting review"
              href="/brokers/pending"
              icon="👥"
              gradient="from-orange-400 to-red-500"
            />
            <MetricCard
              title="Active Brokers"
              value={loading ? "..." : stats.activeBrokers.toLocaleString()}
              change="+12 this week"
              changeType="increase"
              description="Verified & active"
              href="/brokers"
              icon="✅"
              gradient="from-green-400 to-emerald-500"
            />
            <MetricCard
              title="Property Listings"
              value={loading ? "..." : stats.totalListings.toLocaleString()}
              change="+45 today"
              changeType="increase"
              description="Total on platform"
              href="/listings"
              icon="🏠"
              gradient="from-blue-400 to-cyan-500"
            />
            <MetricCard
              title="Monthly Revenue"
              value={loading ? "..." : `${(stats.monthlyRevenue / 1000).toFixed(0)}K ETB`}
              change="+8.2% vs last month"
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
                    badge={stats.pendingBrokers > 0 ? stats.pendingBrokers.toString() : undefined}
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
                    badge={stats.pendingReviews > 0 ? stats.pendingReviews.toString() : undefined}
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
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                ) : (
                  recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
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
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const statusIcons = {
    success: '✅',
    warning: '⚠️', 
    info: 'ℹ️'
  };

  return (
    <div className="flex items-start space-x-3">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${statusColors[activity.status]}`}>
        {statusIcons[activity.status]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
      </div>
    </div>
  );
}
