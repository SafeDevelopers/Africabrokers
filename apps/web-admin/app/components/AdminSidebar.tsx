"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: "🏠"
  },
  {
    name: "Broker Management",
    href: "/brokers",
    icon: "👥",
    children: [
      { name: "All Brokers", href: "/brokers", icon: "📋" },
      { name: "Pending Applications", href: "/brokers/pending", icon: "⏳", badge: 12 },
      { name: "Verification Queue", href: "/brokers/verification", icon: "✅" },
      { name: "QR Code Generation", href: "/qr-codes", icon: "📱" }
    ]
  },
  {
    name: "Property Listings",
    href: "/listings",
    icon: "🏠",
    children: [
      { name: "All Listings", href: "/listings", icon: "📋" },
      { name: "Pending Review", href: "/listings/pending", icon: "⏳", badge: 8 },
      { name: "Featured Properties", href: "/listings/featured", icon: "⭐" },
      { name: "Reported Listings", href: "/listings/reported", icon: "🚨" }
    ]
  },
  {
    name: "Reviews & Compliance",
    href: "/reviews",
    icon: "📊",
    children: [
      { name: "Pending Reviews", href: "/reviews/pending", icon: "⏳" },
      { name: "Compliance Reports", href: "/reviews/compliance", icon: "📈" },
      { name: "Audit Logs", href: "/reviews/audit", icon: "📝" }
    ]
  },
  {
    name: "User Management",
    href: "/users",
    icon: "👤"
  },
  {
    name: "Platform Settings",
    href: "/settings",
    icon: "⚙️"
  },
  {
    name: "Analytics & Reports",
    href: "/reports",
    icon: "📈"
  }
];

export default function AdminSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out lg:transition-none`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AfriBrok</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto pb-20">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                pathname={pathname}
              />
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AU</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@afribrok.et</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              ☰
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold">AfriBrok Admin</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${
            pathname.startsWith(item.href) && item.href !== '/' 
              ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' 
              : 'text-gray-700 hover:bg-gray-50'
          } group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
        >
          <span className="mr-3 text-lg">{item.icon}</span>
          <span className="flex-1">{item.name}</span>
          {item.badge && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
          <span className={`ml-2 transform transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}>
            ▶
          </span>
        </button>
        
        {isOpen && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <Link
                key={child.name}
                href={child.href}
                className={`${
                  pathname === child.href
                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center w-full pl-10 pr-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
              >
                <span className="mr-3">{child.icon}</span>
                <span className="flex-1">{child.name}</span>
                {child.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {child.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${
        isActive
          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
          : 'text-gray-700 hover:bg-gray-50'
      } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
    >
      <span className="mr-3 text-lg">{item.icon}</span>
      <span className="flex-1">{item.name}</span>
      {item.badge && (
        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}