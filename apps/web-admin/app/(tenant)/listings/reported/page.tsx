import { Suspense } from "react";
import { apiRequest } from "../../../../lib/api-server";
import { ReportedListingsClient } from "./reported-listings-client";

interface ReportedListing {
  id: string;
  title: string;
  address: string;
  price: number;
  currency: string;
  listingType: 'sale' | 'rent';
  propertyType: 'apartment' | 'house' | 'commercial' | 'land';
  broker: {
    id: string;
    businessName: string;
    email: string;
  };
  reportedAt: string;
  reportedBy: {
    id: string;
    email: string;
    type: 'user' | 'broker' | 'anonymous';
  };
  reportReason: string;
  reportDetails: string;
  status: 'new' | 'under_investigation' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolutionNotes?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

async function fetchReportedListings(): Promise<ReportedListing[]> {
  try {
    // TODO: Replace with actual admin reported listings endpoint when available
    const data = await apiRequest<{ reports: any[] }>('/v1/admin/listings/reported');
    return transformApiReports(data.reports || []);
  } catch (error) {
    console.error('Error fetching reported listings:', error);
    return [];
  }
}

function transformApiReports(apiReports: any[]): ReportedListing[] {
  return apiReports.map((r: any) => {
    const listing = r.listing || {};
    const property = listing.property || {};
    const address = typeof property.address === 'object' ? property.address : {};
    
    return {
      id: r.id || listing.id || '',
      title: listing.title || r.title || 'Property Listing',
      address: typeof address === 'object' 
        ? [address.street, address.subcity, address.city].filter(Boolean).join(', ') || 'Address not specified'
        : String(address) || 'Address not specified',
      price: Number(listing.priceAmount) || Number(r.price) || 0,
      currency: listing.priceCurrency || r.currency || 'ETB',
      listingType: (listing.channels as any)?.purpose || r.listingType || 'rent',
      propertyType: property.type || r.propertyType || 'apartment',
      broker: {
        id: listing.broker?.id || property.broker?.id || r.brokerId || '',
        businessName: (listing.broker?.licenseDocs as any)?.businessName || 
                     (property.broker?.licenseDocs as any)?.businessName || 
                     r.broker?.businessName || 
                     'Unknown Broker',
        email: r.broker?.email || ''
      },
      reportedAt: r.reportedAt || r.createdAt || new Date().toISOString(),
      reportedBy: {
        id: r.reportedBy?.id || r.reporterId || '',
        email: r.reportedBy?.email || r.reporterEmail || 'anonymous',
        type: r.reportedBy?.type || r.reporterType || 'anonymous'
      },
      reportReason: r.reason || r.reportReason || 'General concern',
      reportDetails: r.details || r.reportDetails || r.description || '',
      status: r.status || 'new',
      assignedTo: r.assignedTo || r.assigneeId,
      resolutionNotes: r.resolutionNotes || r.notes,
      severity: r.severity || 'medium'
    };
  });
}

async function ReportedListingsContent() {
  try {
    const listings = await fetchReportedListings();
    return <ReportedListingsClient initialListings={listings} />;
  } catch (error) {
    return <ErrorDisplay error={error} />;
  }
}

function ErrorDisplay({ error }: { error: unknown }) {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Reported Listings</h1>
          <p className="text-sm text-gray-500">Investigate and resolve user reports about problematic listings</p>
        </div>
      </header>
      <main className="px-6 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-xl font-semibold text-red-900">Failed to load reported listings</h2>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching reported listings."}
              </p>
              <a
                href="/listings/reported"
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

export default function ReportedListingsPage() {
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
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-gray-200 rounded"></div>
              ))}
            </div>
          </main>
        </div>
      }
    >
      <ReportedListingsContent />
    </Suspense>
  );
}
