"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/auth-context";
import { userInquiries, currentUser } from "../data/mock-data";
import { User, LogIn, ChevronDown, LogOut, LayoutDashboard, Building2, Shield } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/#services", label: "Our Services" },
  { href: "/agents", label: "For Governments & Agencies" },
  { href: "/inquiries", label: "Messages" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  
  // Hide navigation menu on broker dashboard pages
  const isBrokerDashboard = pathname?.startsWith('/broker/') && pathname !== '/broker/apply';

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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const commonLinkClasses =
    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary";

  // show inquiries count only for demo currentUser
  const inquiriesCount = user && user.email === currentUser.email ? userInquiries.length : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-6 py-4">
        <div className="flex flex-1 items-center gap-4">
          <Link href="/" className="group flex items-center gap-2.5 text-lg font-bold text-primary transition-all hover:text-indigo-600">
            <LogoBadge />
            <span>AfriBrok Marketplace</span>
          </Link>

          {!isBrokerDashboard && (
            <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
              {navLinks.map((link) => {
                if (link.href === "/inquiries" && !user) return null;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${commonLinkClasses} ${isActive(link.href) ? "bg-primary/10 font-semibold text-primary" : "text-slate-600 hover:text-primary"}`}
                  >
                    {link.label}
                    {link.href === "/inquiries" && user ? (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm ring-1 ring-rose-200">
                        {inquiriesCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          Menu
        </button>

        <div className="hidden items-center gap-3 md:flex">
          {/* CTAs for public users */}
          {!user || (user.role !== "broker" && user.role !== "real-estate") ? (
            <>
              <Link
                href="/sell"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm"
              >
                <Building2 className="w-4 h-4" />
                Have a property to sell?
              </Link>
              <Link
                href="/broker/apply"
                className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20 hover:shadow-sm"
              >
                <Shield className="w-4 h-4" />
                Become a Certified Broker
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/broker/listings/new"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm"
              >
                <Building2 className="w-4 h-4" />
                List a Property
              </Link>
            </>
          )}
          
          {/* Account Dropdown - only show for logged in brokers (broker or real-estate roles) */}
          {user && (user.role === "broker" || user.role === "real-estate") && (
            <div className="relative" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm"
              >
                <User className="w-5 h-5" />
                <span>Account</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${accountDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      {user.status !== "approved" && (
                        <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                          Pending approval
                        </span>
                      )}
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setAccountDropdownOpen(false);
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {!isBrokerDashboard && navLinks.map((link) => {
              if (link.href === "/inquiries" && !user) return null;
              return (
                <Link key={link.href} href={link.href} className={`${commonLinkClasses} ${isActive(link.href) ? "bg-primary/10 text-primary" : "text-slate-600"}`} onClick={() => setOpen(false)}>
                  {link.label}
                  {link.href === "/inquiries" && user ? (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">{inquiriesCount}</span>
                  ) : null}
                </Link>
              );
            })}

            {/* Mobile CTAs */}
            {!user || (user.role !== "broker" && user.role !== "real-estate") ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
                <Link href="/sell" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={() => setOpen(false)}>
                  <Building2 className="w-4 h-4" />
                  Have a property to sell?
                </Link>
                <Link href="/broker/apply" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10" onClick={() => setOpen(false)}>
                  <Shield className="w-4 h-4" />
                  Become a Certified Broker
                </Link>
              </div>
            ) : user && (user.role === "broker" || user.role === "real-estate") ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2 px-3 py-2">
                  <User className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Account</span>
                </div>
                <div className="px-3 py-2 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  {user.status !== "approved" && (
                    <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      Pending approval
                    </span>
                  )}
                </div>
                <Link href={dashboardHref} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    router.push("/");
                  }}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function LogoBadge() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-500 text-sm font-bold text-white shadow-lg ring-2 ring-primary/20 transition-transform group-hover:scale-110">AB</span>
  );
}
