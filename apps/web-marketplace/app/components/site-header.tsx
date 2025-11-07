"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/auth-context";
import { User, LogIn, ChevronDown, LogOut, LayoutDashboard, Building2, Shield, Home, Search, Info, MessageSquare, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/listings", label: "Listings", icon: Search },
  { href: "/#services", label: "Our Services", icon: Building2 },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/contact", label: "Contact Us", icon: MessageSquare },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  
  // Hide navigation menu on broker dashboard pages only
  // Note: /listings is the public listings page, not a broker dashboard route
  const isBrokerDashboard = pathname && (
    pathname.startsWith('/broker/') && 
    pathname !== '/broker/apply' && 
    pathname !== '/broker/signin' &&
    !pathname.startsWith('/broker/apply/')
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    }

    if (accountDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [accountDropdownOpen]);

  const dashboardHref = (() => {
    if (!user) return "/broker/dashboard";
    if (user.role === "broker") return user.status === "approved" ? "/broker/dashboard" : "/broker/pending";
    // Only brokers have dashboards now
    return "/broker/dashboard";
  })();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/#services") return pathname === "/" && typeof window !== 'undefined' && window.location.hash === "#services";
    return pathname?.startsWith(href);
  };


  return (
    <header className="sticky top-0 z-50 border-b-2 border-slate-200/60 bg-white/98 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-6 px-4 py-4 sm:px-6">
        <div className="flex flex-1 items-center gap-6">
          <Link href="/" className="group flex items-center gap-3 text-xl font-bold text-primary transition-all hover:scale-105">
            <LogoBadge />
            <span className="hidden sm:inline">AfriBrok Marketplace</span>
            <span className="sm:hidden">AfriBrok</span>
          </Link>

          {!isBrokerDashboard && (
            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-primary/10 to-indigo-50 text-primary shadow-sm"
                        : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform ${active ? "scale-110 text-primary" : "text-slate-500 group-hover:scale-110 group-hover:text-primary"}`} />
                    <span className="relative">
                      {link.label}
                      {active && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-indigo-500 rounded-full" />
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden items-center gap-3 md:flex">
          {/* Broker Sign In - Only show when not logged in or not a broker */}
          {(!user || user.role !== "broker") && (
            <Link
              href="/broker/signin"
              className="flex items-center gap-2 rounded-xl border-2 border-indigo-600 bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg hover:scale-105"
            >
              <LogIn className="h-4 w-4" />
              <span>Broker Sign In</span>
            </Link>
          )}
          
          {/* List a Property - Only show for logged in brokers */}
          {user && user.role === "broker" && (
            <Link
              href="/listings/new"
              className="flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-indigo-50 px-5 py-2.5 text-sm font-bold text-primary shadow-md transition-all hover:border-primary hover:from-primary/20 hover:to-indigo-100 hover:shadow-lg hover:scale-105"
            >
              <Building2 className="h-4 w-4" />
              <span>List Property</span>
            </Link>
          )}
          
          {/* Account Dropdown - only show for logged in brokers */}
          {user && user.role === "broker" && (
            <div className="relative" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-2.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-xs font-bold text-white shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${accountDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border-2 border-slate-200 bg-white shadow-2xl ring-4 ring-primary/10">
                  <div className="overflow-hidden rounded-2xl">
                    <div className="bg-gradient-to-r from-primary/10 to-indigo-50 px-5 py-4 border-b-2 border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">{user.email}</p>
                      {user.status !== "approved" && (
                        <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm">
                          Pending approval
                        </span>
                      )}
                    </div>
                    <div className="py-2">
                      <Link
                        href={dashboardHref}
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-gradient-to-r hover:from-primary/10 hover:to-indigo-50 hover:text-primary"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          setAccountDropdownOpen(false);
                          await logout();
                          // logout() already does a hard redirect, so we don't need router.push
                        }}
                        className="flex w-full items-center gap-3 px-5 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t-2 border-slate-200 bg-gradient-to-b from-white to-slate-50/50 md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {!isBrokerDashboard && navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-primary/10 to-indigo-50 text-primary shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-primary"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-slate-500 group-hover:text-primary"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Mobile - Broker Sign In or Account */}
            {!user || user.role !== "broker" ? (
              <div className="mt-4 flex flex-col gap-2 border-t-2 border-slate-200 pt-4">
                <Link
                  href="/broker/signin"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg"
                  onClick={() => setOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Broker Sign In</span>
                </Link>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2 border-t-2 border-slate-200 pt-4">
                <div className="rounded-xl bg-gradient-to-r from-primary/10 to-indigo-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-sm font-bold text-white shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs font-medium text-slate-600">{user.email}</p>
                      {user.status !== "approved" && (
                        <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
                          Pending approval
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href="/listings/new"
                  className="flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-indigo-50 px-4 py-3 text-sm font-bold text-primary shadow-sm transition-all hover:from-primary/20 hover:to-indigo-100"
                  onClick={() => setOpen(false)}
                >
                  <Building2 className="h-5 w-5" />
                  <span>List a Property</span>
                </Link>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false);
                    await logout();
                    // logout() already does a hard redirect, so we don't need router.push
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function LogoBadge() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-500 text-base font-bold text-white shadow-xl ring-4 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:ring-primary/30">AB</span>
  );
}
