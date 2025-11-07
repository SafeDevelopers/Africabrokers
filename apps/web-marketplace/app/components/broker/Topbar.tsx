"use client";

import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import { TenantPill } from "../TenantPill";
import { LogOut } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    // Call auth context logout which handles everything and redirects
    await logout();
    // logout() already does a hard redirect, so we don't need router.push
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="mx-auto max-w-screen-2xl px-6 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 pl-10 lg:pl-0">
            <h1 className="text-lg font-semibold text-slate-900">
              {user?.name || 'Broker'}
            </h1>
            <TenantPill />
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

