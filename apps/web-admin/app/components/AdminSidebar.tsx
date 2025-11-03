"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const navigation: NavItem[] = [
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
    name: "Platform Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />
  },
  {
    name: "Analytics & Reports",
    href: "/reports",
    icon: <BarChart3 className="w-5 h-5" />
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
      } fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl transform lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out lg:transition-none border-r border-gray-700`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700/50 bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white">AfriBrok</span>
              <p className="text-xs text-gray-400">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 flex-1 overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-indigo-500/50">
              <span className="text-white text-sm font-semibold">AU</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@afribrok.et</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-gray-900">AfriBrok Admin</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(pathname.startsWith(item.href) && item.href !== '/');
  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${
            isActive
              ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border-l-4 border-indigo-500' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
          } group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-1`}
        >
          <span className={`mr-3 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
            {item.icon}
          </span>
          <span className="flex-1 text-left">{item.name}</span>
          {item.badge && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {item.badge}
            </span>
          )}
          <ChevronRight className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
        </button>
        
        {isOpen && (
          <div className="mt-1 ml-4 space-y-1 border-l border-gray-700/50 pl-4">
            {item.children?.map((child) => {
              const isChildActive = pathname === child.href;
              return (
                <Link
                  key={child.name}
                  href={child.href}
                  className={`${
                    isChildActive
                      ? 'bg-indigo-600/30 text-white border-l-2 border-indigo-400'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  } group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200`}
                >
                  <span className={`mr-3 ${isChildActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                    {child.icon}
                  </span>
                  <span className="flex-1">{child.name}</span>
                  {child.badge && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {child.badge}
                    </span>
                  )}
                </Link>
              );
            })}
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
          ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border-l-4 border-indigo-500'
          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
      } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-1`}
    >
      <span className={`mr-3 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
        {item.icon}
      </span>
      <span className="flex-1">{item.name}</span>
      {item.badge && (
        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
