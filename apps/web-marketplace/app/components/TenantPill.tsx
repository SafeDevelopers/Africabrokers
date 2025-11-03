"use client";

import { useState, useEffect, useRef } from "react";
import { getTenant, setTenant, getTenantInfo, type TenantInfo } from "../../lib/tenant";
import { trackTenantChange } from "../../lib/analytics";
import { ChevronDown } from "lucide-react";

export function TenantPill() {
  const [tenantSlug, setTenantSlug] = useState<string>(() => getTenant());
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>(() => getTenantInfo());
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleTenantChange = (newTenant: string) => {
    const previous = tenantSlug;
    setTenant(newTenant);
    setTenantSlug(newTenant);
    setTenantInfo(getTenantInfo(newTenant));
    setIsOpen(false);
    trackTenantChange({ tenant: newTenant, previous });
    // Refresh page to apply tenant changes
    window.location.reload();
  };

  // For now, only one tenant is available
  const availableTenants: TenantInfo[] = [
    { slug: 'et-addis', name: 'Ethiopia — Addis Ababa', country: 'Ethiopia', flag: '🇪🇹' },
  ];

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg ring-1 ring-gray-200/50 transition-all hover:shadow-xl hover:ring-primary/20"
      >
        <span className="text-base">{tenantInfo.flag}</span>
        <span>{tenantInfo.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-white shadow-xl ring-1 ring-gray-200/50 p-2 z-50">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select Location
            </div>
            {availableTenants.map((tenant) => (
              <button
                key={tenant.slug}
                onClick={() => handleTenantChange(tenant.slug)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  tenantSlug === tenant.slug
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tenant.flag}</span>
                <div className="flex-1">
                  <div className="font-semibold">{tenant.name}</div>
                  <div className="text-xs text-gray-500">{tenant.country}</div>
                </div>
                {tenantSlug === tenant.slug && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))}
            <div className="border-t border-gray-200 pt-2 px-3 pb-1">
              <p className="text-xs text-gray-500">
                More locations coming soon
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

