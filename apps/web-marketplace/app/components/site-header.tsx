"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { userInquiries, currentUser } from "../data/mock-data";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/favorites", label: "Favorites" },
  { href: "/inquiries", label: "Inquiries" },
  { href: "/verify", label: "Verify Broker" },
  { href: "/broker/apply", label: "Broker Apply" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const dashboardHref = (() => {
    if (!user) return "/dashboard";
    if (user.role === "broker") return user.status === "approved" ? "/broker/dashboard" : "/broker/pending";
    if (user.role === "individual" || user.role === "real-estate")
      return user.status === "approved" ? "/seller/dashboard" : "/seller/pending";
    return "/dashboard";
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
          {user ? (
            <>
              <span className="text-sm font-medium text-slate-600">Hi, {user.name.split(" ")[0]}</span>
              {user.status !== "approved" ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending approval</span>
              ) : null}
              <Link href={dashboardHref} className="rounded-lg border-2 border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/10 hover:shadow-md">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-primary hover:shadow-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-primary hover:shadow-sm">
                Sign in
              </Link>
              <Link href="/auth/register" className="rounded-lg bg-gradient-to-r from-primary to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-indigo-600 hover:to-primary active:scale-95">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {navLinks.map((link) => {
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

            <div className="mt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={dashboardHref} className="rounded-md border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  {user.status !== "approved" ? (
                    <span className="rounded-md bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending approval</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      router.push("/");
                    }}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90" onClick={() => setOpen(false)}>
                    Create account
                  </Link>
                </>
              )}
            </div>
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
