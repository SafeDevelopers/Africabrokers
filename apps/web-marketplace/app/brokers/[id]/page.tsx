"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Star, MapPin, Phone, Mail, CheckCircle, Clock, TrendingUp, Building2 } from "lucide-react";

interface Broker {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  city?: string;
  licenseNumber: string;
  verified: boolean;
  rating?: number;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  stats?: {
    activeListings: number;
    closedDeals: number;
    responseTime: string;
    rating: number;
  };
  listings?: Listing[];
}

interface Listing {
  id: string;
  title: string;
  location: string;
  priceLabel: string;
  image?: string;
  imageUrl?: string;
}

export default function BrokerProfilePage() {
  const params = useParams();
  const brokerId = params?.id as string;
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get tenant from cookie
  const getTenantId = () => {
    if (typeof document === 'undefined') return 'et-addis';
    const cookies = document.cookie.split(';');
    const tenantCookie = cookies.find(c => c.trim().startsWith('afribrok-tenant='));
    return tenantCookie ? tenantCookie.split('=')[1] : 'et-addis';
  };

  useEffect(() => {
    const fetchBroker = async () => {
      try {
        setLoading(true);
        setError(null);
        const tenantId = getTenantId();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/public/brokers/${brokerId}`,
          {
            headers: {
              'X-Tenant': tenantId,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Broker not found');
          }
          throw new Error('Failed to fetch broker');
        }

        const data = await response.json();
        setBroker(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load broker');
      } finally {
        setLoading(false);
      }
    };

    if (brokerId) {
      fetchBroker();
    }
  }, [brokerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading broker profile...</p>
        </div>
      </div>
    );
  }

  if (error || !broker) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{error || 'Broker not found'}</h1>
          <Link href="/brokers" className="text-primary hover:underline">
            Browse all brokers →
          </Link>
        </div>
      </div>
    );
  }

  const brokerListings = broker.listings || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-500 text-2xl font-bold text-white shadow-lg ring-4 ring-primary/20">
                {broker.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900">{broker.name}</h1>
                  {broker.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                {broker.company && <p className="text-lg text-slate-600">{broker.company}</p>}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  {(broker.location || broker.city) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{broker.location || broker.city}</span>
                    </div>
                  )}
                  {broker.stats?.rating !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{broker.stats.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {broker.stats?.responseTime && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{broker.stats.responseTime} response</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex gap-3">
                {broker.phone && (
                  <Link
                    href={`tel:${broker.phone}`}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/10"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </Link>
                )}
                {broker.email && (
                  <Link
                    href={`mailto:${broker.email}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90"
                  >
                    <Mail className="w-4 h-4" />
                    Contact
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-screen-xl px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {broker.bio && (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About</h2>
                <p className="text-slate-700 leading-relaxed">{broker.bio}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">License</p>
                    <p className="text-slate-900 font-mono">{broker.licenseNumber}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Specialties */}
            {(broker.specialties && broker.specialties.length > 0) || (broker.languages && broker.languages.length > 0) ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                {broker.specialties && broker.specialties.length > 0 && (
                  <>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Specialties</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {broker.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {broker.languages && broker.languages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {broker.languages.map((language, index) => (
                        <span
                          key={index}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ) : null}

            {/* Active Listings */}
            {brokerListings.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Active Listings</h2>
                  <span className="text-sm text-slate-600">{brokerListings.length} properties</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {brokerListings.slice(0, 6).map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-primary hover:shadow-md"
                    >
                      <div className="mb-3 aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
                        {listing.imageUrl ? (
                          <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl">
                            {listing.image}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{listing.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{listing.location}</p>
                      <p className="text-sm font-semibold text-primary">{listing.priceLabel}</p>
                    </Link>
                  ))}
                </div>
                {brokerListings.length > 6 && (
                  <Link
                    href={`/listings?broker=${brokerId}`}
                    className="mt-4 block text-center text-sm font-semibold text-primary hover:underline"
                  >
                    View all {brokerListings.length} listings →
                  </Link>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Active Listings</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{broker.stats?.activeListings || 0}</span>
                </div>
                {broker.stats?.closedDeals !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Closed Deals</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{broker.stats.closedDeals}</span>
                  </div>
                )}
                {broker.stats?.rating !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                        <Star className="w-5 h-5 text-yellow-600 fill-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Rating</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{broker.stats.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {broker.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <Link href={`tel:${broker.phone}`} className="text-sm text-slate-700 hover:text-primary">
                      {broker.phone}
                    </Link>
                  </div>
                )}
                {broker.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <Link href={`mailto:${broker.email}`} className="text-sm text-slate-700 hover:text-primary">
                      {broker.email}
                    </Link>
                  </div>
                )}
                {(broker.location || broker.city) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <p className="text-sm text-slate-700">{broker.location || broker.city}</p>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-slate-500">License:</span>
                  <p className="text-sm text-slate-700 font-mono">{broker.licenseNumber}</p>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            {broker.verified && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 mb-1">Verified Broker</p>
                    <p className="text-sm text-emerald-700">
                      This broker has been verified by AfriBrok. All credentials and licenses have been confirmed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

