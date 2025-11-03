"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Phone, Mail, CheckCircle, Building2, Users } from "lucide-react";

interface Broker {
  id: string;
  name: string;
  licenseNumber: string;
  city?: string;
  phone?: string;
  email?: string;
  company?: string;
  verified: boolean;
  rating?: number;
  activeListings?: number;
}

interface BrokersResponse {
  items: Broker[];
  total: number;
  limit: number;
  offset: number;
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Get tenant from cookie
  const getTenantId = () => {
    if (typeof document === 'undefined') return 'et-addis';
    const cookies = document.cookie.split(';');
    const tenantCookie = cookies.find(c => c.trim().startsWith('afribrok-tenant='));
    return tenantCookie ? tenantCookie.split('=')[1] : 'et-addis';
  };

  const fetchBrokers = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentOffset = reset ? 0 : offset;
      const tenantId = getTenantId();
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString(),
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (cityFilter) {
        params.append('city', cityFilter);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/public/brokers?${params.toString()}`,
        {
          headers: {
            'X-Tenant': tenantId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch brokers');
      }

      const data: BrokersResponse = await response.json();
      
      if (reset) {
        setBrokers(data.items);
        setOffset(data.items.length);
      } else {
        setBrokers(prev => [...prev, ...data.items]);
        setOffset(prev => prev + data.items.length);
      }
      
      setTotal(data.total);
      setHasMore(data.items.length === limit && currentOffset + data.items.length < data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brokers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers(true);
  }, [searchQuery, cityFilter]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchBrokers(false);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Trust Ribbon */}
      <div className="border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="mx-auto max-w-screen-2xl px-6 py-4">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <span className="text-xl flex-shrink-0">🛡️</span>
            <p className="font-medium">
              All brokers listed on AfriBrok are licensed and verified. You can confirm any broker's status using their{' '}
              <Link href="/verify" className="text-primary hover:underline font-semibold">
                QR code
              </Link>
              {' '}or license number.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Verified Brokers Directory</h1>
          <p className="text-lg text-slate-600 max-w-2xl mb-8">
            Browse our directory of certified and verified brokers. All brokers are licensed professionals approved by AfriBrok.
          </p>

          {/* Search and Filter */}
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, license number, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="pl-12 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none bg-white"
              >
                <option value="">All Cities</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Dire Dawa">Dire Dawa</option>
                <option value="Hawassa">Hawassa</option>
                <option value="Mekelle">Mekelle</option>
                <option value="Bahir Dar">Bahir Dar</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Brokers Grid */}
      <main className="mx-auto max-w-screen-2xl px-6 py-12">
        {loading && brokers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading brokers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchBrokers(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        ) : brokers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">No brokers found</h2>
            <p className="text-slate-600">
              {searchQuery || cityFilter
                ? "Try adjusting your search or filters"
                : "No verified brokers available at this time"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {brokers.length} of {total} verified brokers
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {brokers.map((broker) => (
                <div
                  key={broker.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{broker.name}</h3>
                      {broker.company && (
                        <p className="text-sm text-slate-600 mb-2">{broker.company}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {broker.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        {broker.rating && (
                          <span className="text-xs text-slate-500">
                            ⭐ {broker.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Building2 className="w-8 h-8 text-primary flex-shrink-0" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-medium">License:</span>
                      <span className="font-mono">{broker.licenseNumber}</span>
                    </div>
                    {broker.city && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{broker.city}</span>
                      </div>
                    )}
                    {broker.activeListings !== undefined && (
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">{broker.activeListings}</span> active listings
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    {broker.phone && (
                      <button
                        onClick={() => handleCall(broker.phone!)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                    )}
                    {broker.email && (
                      <button
                        onClick={() => handleEmail(broker.email!)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>
                    )}
                    <Link
                      href={`/brokers/${broker.id}`}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load More Brokers"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

