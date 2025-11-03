"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Link2,
  Building2,
  QrCode,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const brokerNavigation = [
  { name: "Dashboard", href: "/broker/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/broker/leads", icon: Users },
  { name: "Referral", href: "/broker/referral", icon: Link2 },
  { name: "Listings", href: "/broker/listings", icon: Building2 },
  { name: "QR Code", href: "/broker/qr", icon: QrCode },
  { name: "Documents", href: "/broker/docs", icon: FileText },
  { name: "Settings", href: "/broker/settings", icon: Settings },
];

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout: authLogout, login } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(false);

  // Check if this is a public route that shouldn't have the layout
  const isPublicRoute = pathname === '/broker/apply' || pathname === '/broker/pending';

  // Handle auth from URL params (cross-origin auth from admin app)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if auth info was passed via URL params from admin app
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const emailParam = urlParams.get('email');
    const userIdParam = urlParams.get('userId');
    const tenantIdParam = urlParams.get('tenantId');
    const tokenParam = urlParams.get('token');
    
    // Process URL params if they exist (from admin app)
    if (roleParam === 'BROKER' && emailParam && userIdParam && tokenParam && !user) {
      // Set cookies for middleware FIRST
      document.cookie = `afribrok-role=BROKER; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `afribrok-user-id=${userIdParam}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `afribrok-token=${tokenParam}; path=/; max-age=86400; SameSite=Lax`;
      if (tenantIdParam) {
        document.cookie = `afribrok-tenant=${tenantIdParam}; path=/; max-age=86400; SameSite=Lax`;
      }
      
      // Set user in auth context (this will update localStorage too)
      login({
        name: emailParam.split('@')[0] || 'Broker',
        email: emailParam,
        role: 'broker',
        status: 'approved'
      });
      
      // Clean up URL params after setting auth
      const cleanUrl = pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [pathname, login, user]);

  useEffect(() => {
    // Skip auth checks for public routes
    if (isPublicRoute) {
      setIsCheckingAuth(false);
      return;
    }
    
    // Check if URL has auth params (coming from admin app)
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const hasAuthParams = urlParams && urlParams.get('role') === 'BROKER' && urlParams.get('token');
    
    // If we have cookies but no user yet, wait a bit more (user might be loading from localStorage or URL params)
    const hasBrokerCookie = typeof document !== 'undefined' && 
      document.cookie.split(';').some(c => c.trim().startsWith('afribrok-role=BROKER'));
    
    // If we have cookies or auth params but no user yet, wait for user to be set
    if (!user && (hasBrokerCookie || hasAuthParams)) {
      // Wait longer if we have auth params (user was just set in previous useEffect)
      const waitTime = hasAuthParams ? 2000 : 1000; // Increased wait time to allow state update
      const waitTimer = setTimeout(() => {
        setIsCheckingAuth(false);
        // After waiting, the useEffect will re-run with the updated user value from dependency array
        // The render will also check for cookies/params again before showing Access Denied
      }, waitTime);
      return () => clearTimeout(waitTimer);
    }
    
    // If we have a user, check auth immediately
    if (user) {
      setIsCheckingAuth(false);
      
      // Role gate: only broker role can access
      if (user.role !== "broker" && user.role !== "real-estate") {
        // Access denied - redirect to homepage
        router.push("/");
        return;
      }

      // Check if broker is approved
      if (user.status !== "approved") {
        router.push("/broker/pending");
        return;
      }
    } else if (!hasBrokerCookie && !hasAuthParams) {
      // No user, no cookies, no params - give a short delay then check
      const checkTimer = setTimeout(() => {
        setIsCheckingAuth(false);
        // Will redirect or show access denied in render
      }, 500);
      return () => clearTimeout(checkTimer);
    }
    // If we have cookies/params but no user, we already handled it above - wait longer
  }, [user, router, pathname, isPublicRoute]);

  // Timeout effect to prevent infinite loading from stale cookies
  useEffect(() => {
    const hasBrokerCookie = typeof document !== 'undefined' && 
      document.cookie.split(';').some(c => c.trim().startsWith('afribrok-role=BROKER'));
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const hasAuthParams = urlParams && urlParams.get('role') === 'BROKER' && urlParams.get('token');
    
    // If we have cookies/params but no user, set a timeout to break out of loading
    if (!user && (hasBrokerCookie || hasAuthParams)) {
      const timeout = setTimeout(() => {
        setAuthTimeout(true);
        // Clear stale cookies if user isn't set after timeout
        if (typeof document !== 'undefined') {
          document.cookie.split(';').forEach((cookie) => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.startsWith('afribrok-')) {
              document.cookie = `${name}=;path=/;max-age=0`;
            }
          });
        }
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timeout);
    } else {
      setAuthTimeout(false);
    }
  }, [user]);

  // Don't show layout for public routes - they're public
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  const hasBrokerCookie = typeof document !== 'undefined' && 
    document.cookie.split(';').some(c => c.trim().startsWith('afribrok-role=BROKER'));
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hasAuthParams = urlParams && urlParams.get('role') === 'BROKER' && urlParams.get('token');
  
  // Show loading if we have auth indicators but no user (unless timeout reached)
  if (!user && !authTimeout && (hasBrokerCookie || hasAuthParams)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show access denied only if we've finished checking and there's no user or wrong role
  if (!user || (user.role !== "broker" && user.role !== "real-estate")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-sm text-slate-600 mb-4">Only approved brokers can access this dashboard.</p>
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            Go to homepage →
          </Link>
        </div>
      </div>
    );
  }

  if (user.status !== "approved") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Awaiting Approval</h1>
          <p className="text-sm text-slate-600 mb-4">Your broker account is pending verification.</p>
          <Link href="/broker/pending" className="text-sm font-semibold text-primary hover:underline">
            View status →
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    // Call auth context logout first (clears user state and localStorage)
    authLogout();
    
    // Clear all cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('afribrok-')) {
          document.cookie = `${name}=;path=/;max-age=0`;
        }
      });
    }
    
    // Redirect to homepage
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900">Broker Dashboard</h2>
            <p className="mt-1 text-xs text-slate-500">Manage your listings & leads</p>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {brokerNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Broker Dashboard</h2>
            <Link
              href="/broker/settings"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

