"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  ShieldCheck,
  User,
  Settings,
  BarChart3,
  ChevronRight,
  X,
  Menu,
  CheckSquare,
  QrCode,
  Home,
  Star,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  ScrollText,
  UserCheck,
  LogOut,
  CreditCard,
  Package,
  DollarSign,
} from "lucide-react";
import { ServiceStatus } from "./ServiceStatus";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const tenantAdminNavigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Broker Management",
    href: "/brokers",
    icon: <Users className="w-5 h-5" />,
    children: [
      { name: "All Brokers", href: "/brokers", icon: <FileText className="w-4 h-4" /> },
      { name: "Pending Applications", href: "/brokers/pending", icon: <AlertTriangle className="w-4 h-4" />, badge: 12 },
      { name: "Verification Queue", href: "/brokers/verification", icon: <UserCheck className="w-4 h-4" /> },
      { name: "QR Code Generation", href: "/qr-codes", icon: <QrCode className="w-4 h-4" /> }
    ]
  },
  {
    name: "Property Listings",
    href: "/listings",
    icon: <Building2 className="w-5 h-5" />,
    children: [
      { name: "All Listings", href: "/listings", icon: <FileText className="w-4 h-4" /> },
      { name: "Pending Review", href: "/listings/pending", icon: <AlertTriangle className="w-4 h-4" />, badge: 8 },
      { name: "Featured Properties", href: "/listings/featured", icon: <Star className="w-4 h-4" /> },
      { name: "Reported Listings", href: "/listings/reported", icon: <AlertTriangle className="w-4 h-4" /> }
    ]
  },
  {
    name: "Reviews & Compliance",
    href: "/reviews",
    icon: <ShieldCheck className="w-5 h-5" />,
    children: [
      { name: "Pending Reviews", href: "/reviews/pending", icon: <FileCheck className="w-4 h-4" /> },
      { name: "Compliance Reports", href: "/reviews/compliance", icon: <TrendingUp className="w-4 h-4" /> },
      { name: "Audit Logs", href: "/reviews/audit", icon: <ScrollText className="w-4 h-4" /> }
    ]
  },
  {
    name: "User Management",
    href: "/users",
    icon: <User className="w-5 h-5" />
  },
  {
    name: "Billing",
    href: "/billing/payment-methods",
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      { name: "Payment Methods", href: "/billing/payment-methods", icon: <CreditCard className="w-4 h-4" /> },
      { name: "Broker Plans", href: "/billing/plans", icon: <Package className="w-4 h-4" /> },
      { name: "Invoices", href: "/billing/invoices", icon: <DollarSign className="w-4 h-4" /> },
    ],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />
  },
  {
    name: "Analytics & Reports",
    href: "/reports",
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    name: "System Health",
    href: "/health",
    icon: <ShieldCheck className="w-5 h-5" />
  }
];

export default function TenantAdminSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear cookies on client side
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.startsWith('afribrok-')) {
            document.cookie = `${name}=;path=/;max-age=0`;
          }
        });

        // Redirect to login page
        router.push('/login');
      } else {
        console.error('Logout failed');
        // Even if API fails, clear cookies and redirect
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.startsWith('afribrok-')) {
            document.cookie = `${name}=;path=/;max-age=0`;
          }
        });
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear cookies anyway and redirect
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('afribrok-')) {
          document.cookie = `${name}=;path=/;max-age=0`;
        }
      });
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleExpand = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-bold text-white">Tenant Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {tenantAdminNavigation.map((item) => {
              const itemIsActive = isActive(item.href);
              const isExpanded = expandedItems.has(item.href);

              return (
                <div key={item.href}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.href)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          itemIsActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {item.icon}
                        <span className="font-medium flex-1 text-left">{item.name}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const childIsActive = isActive(child.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                                  childIsActive
                                    ? 'bg-indigo-700 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                              >
                                {child.icon}
                                <span>{child.name}</span>
                                {child.badge && (
                                  <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                    {child.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        itemIsActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {itemIsActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-4 py-4 border-t border-gray-800 space-y-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
            <div className="text-xs text-gray-400">
              <p>Tenant Admin Dashboard</p>
              <p className="mt-1">Single Tenant Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <ServiceStatus />
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

