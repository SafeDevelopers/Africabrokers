import { Suspense } from "react";
import { apiRequest } from "../../../lib/api-server";
import { ListingsClient } from "./listings-client";

interface Listing {
  id: string;
  property: {
    id: string;
    type: 'residential' | 'commercial' | 'land';
    address: {
      street: string;
      subcity: string;
      city: string;
    };
  };
  broker: {
    id: string;
    licenseDocs: {
      businessName: string;
    };
    status: string;
  };
  title: string;
  priceAmount: number;
  currency: string;
  listingType: 'sale' | 'rent' | 'lease';
  status: 'draft' | 'active' | 'pending' | 'suspended' | 'sold';
  featuredUntil?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  inquiryCount: number;
}

async function fetchListings(): Promise<Listing[]> {
  try {
    const data = await apiRequest<{ items: any[] }>('/v1/admin/listings');
    return transformApiListings(data.items || []);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

function transformApiListings(apiListings: any[]): Listing[] {
  return apiListings.map((l: any) => {
    const property = l.property || {};
    const address = typeof property.address === 'object' ? property.address : {};
    
    return {
      id: l.id,
      property: {
        id: property.id || '',
        type: property.type || 'residential',
        address: {
          street: address.street || '',
          subcity: address.subcity || address.district || '',
          city: address.city || ''
        }
      },
      broker: {
        id: l.broker?.id || property.broker?.id || '',
        licenseDocs: {
          businessName: (property.broker?.licenseDocs as any)?.businessName || 
                       (l.broker?.licenseDocs as any)?.businessName || 
                       'Unknown Broker'
        },
        status: property.broker?.status || l.broker?.status || 'approved'
      },
      title: l.title || (l.attrs as any)?.title || property.address?.street || 'Property Listing',
      priceAmount: Number(l.priceAmount) || 0,
      currency: l.priceCurrency || 'ETB',
      listingType: (l.channels as any)?.purpose || 'rent',
      status: l.availabilityStatus || 'active',
      featuredUntil: l.featuredUntil,
      createdAt: l.createdAt || new Date().toISOString(),
      updatedAt: l.updatedAt || new Date().toISOString(),
      viewCount: (l.attrs as any)?.viewCount || 0,
      inquiryCount: (l.attrs as any)?.inquiryCount || 0
    };
  });
}

async function ListingsContent() {
  try {
    const listings = await fetchListings();
    return <ListingsClient initialListings={listings} />;
  } catch (error) {
    return <ErrorDisplay error={error} />;
  }
}

function ErrorDisplay({ error }: { error: unknown }) {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Property Listings</h1>
          <p className="text-sm text-gray-500">Manage all property listings across the platform</p>
        </div>
      </header>
      <main className="px-6 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-xl font-semibold text-red-900">Failed to load listings</h2>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching listings."}
              </p>
              <a
                href="/listings"
                className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Try again
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 min-h-full">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </header>
          <main className="px-6 py-8">
            <div className="space-y-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </main>
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
