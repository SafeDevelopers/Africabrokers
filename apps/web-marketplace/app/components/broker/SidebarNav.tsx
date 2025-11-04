"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Files, 
  Plus, 
  CreditCard, 
  User,
  Mail,
  Menu,
  X,
  BarChart3,
  Settings,
  Share2,
  QrCode,
  FileText
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/broker/dashboard", icon: LayoutDashboard },
  { name: "Listings", href: "/broker/listings", icon: Files },
  { name: "New Listing", href: "/broker/listings/new", icon: Plus },
  { name: "Inquiries", href: "/broker/inquiries", icon: Mail },
  { name: "Analytics", href: "/broker/analytics", icon: BarChart3 },
  { name: "Billing", href: "/broker/billing", icon: CreditCard },
  { name: "Referrals", href: "/broker/referral", icon: Share2 },
  { name: "QR Codes", href: "/broker/qr", icon: QrCode },
  { name: "Documents", href: "/broker/docs", icon: FileText },
  { name: "Settings", href: "/broker/settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-slate-700" />
        ) : (
          <Menu className="w-5 h-5 text-slate-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-[260px] 
          border-r border-slate-200 bg-white z-40
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900">Broker Dashboard</h2>
            <p className="mt-1 text-xs text-slate-500">Manage your listings</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium 
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
