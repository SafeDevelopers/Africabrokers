import { Suspense } from "react";
import { ListingsClient } from "./listings-client";
import { type Listing, type ListingPurpose, type ListingStatus } from "../data/mock-data";

type SearchParams = {
  q?: string;
  query?: string;
  purpose?: string;
  status?: string;
  beds?: string;
  type?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
  per?: string;
};

async function fetchListings(searchParams: SearchParams) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
  const tenantKey = process.env.NEXT_PUBLIC_TENANT_KEY;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_CORE_API_BASE_URL is not configured");
  }
  if (!tenantKey) {
    throw new Error("NEXT_PUBLIC_TENANT_KEY is not configured");
  }

  const params = new URLSearchParams();
  const search = searchParams.query || searchParams.q || "";
  if (search) params.set("search", search);
  
  // Map purpose filter (Rent/Sale not directly supported by API, will need to handle in client)
  // Map status filter
  if (searchParams.status && searchParams.status !== "All") {
    const statusMap: Record<string, string> = {
      Verified: "active",
      Pending: "pending_review"
    };
    if (statusMap[searchParams.status]) {
      params.set("availability", statusMap[searchParams.status]);
    }
  }
  
  // Map property type
  if (searchParams.type && searchParams.type !== "All") {
    // API expects: residential | commercial | land
    // We'll need to map from property types in client
    params.set("propertyType", searchParams.type);
  }
  
  if (searchParams.min) params.set("minPrice", searchParams.min);
  if (searchParams.max) params.set("maxPrice", searchParams.max);
  
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.per) || 12;
  params.set("page", String(page));
  params.set("limit", String(limit));

  const url = `${apiBaseUrl}/v1/listings/search?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "X-Tenant": tenantKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
}

function transformApiListingToMock(apiListing: any): Listing {
  const property = apiListing.property || {};
  const address = typeof property.address === "object" ? property.address : {};
  
  // Extract purpose from channels or attrs if available
  const purpose = (apiListing.channels as any)?.purpose || "Rent";
  const priceAmount = Number(apiListing.priceAmount) || 0;
  const priceCurrency = apiListing.priceCurrency || "ETB";
  
  // Format price label
  const priceLabel = purpose === "Rent" 
    ? `${priceCurrency} ${priceAmount.toLocaleString()} / month`
    : `${priceCurrency} ${priceAmount.toLocaleString()}`;
  
  // Map verification status
  const verificationStatus = property.verificationStatus || "draft";
  const status: ListingStatus = verificationStatus === "verified" ? "Verified" : "Pending";
  
  // Extract attributes
  const attrs = (apiListing.attrs as any) || {};
  const bedrooms = attrs.bedrooms ? Number(attrs.bedrooms) : null;
  const bathrooms = attrs.bathrooms ? Number(attrs.bathrooms) : 1;
  const area = attrs.area || "N/A";
  
  // Extract features and amenities
  const features = attrs.features || [];
  const amenities = attrs.amenities || [];
  
  // Get description
  const description = attrs.description || property.description || "";
  
  // Get title from address or property
  const title = attrs.title || (typeof address === "object" ? address.street || "Property" : "Property");
  
  // Get location from address
  const location = typeof address === "object" 
    ? [address.street, address.district, address.city].filter(Boolean).join(", ") || "Location not specified"
    : String(address) || "Location not specified";
  
  // Get property type
  const propertyType = property.type || "Property";
  
  // Get broker ID
  const brokerId = property.broker?.id || apiListing.brokerId || "";
  
  // Get coordinates
  const latitude = property.latitude || 9.145;
  const longitude = property.longitude || 38.7636;
  
  // Image URL (use placeholder or from attrs)
  const imageUrl = attrs.imageUrl || attrs.image || "";
  const image = imageUrl ? "" : "🏠";
  
  // Gallery
  const gallery = attrs.gallery || (imageUrl ? [imageUrl] : []);
  
  // Reviews (not in API response yet, use empty array)
  const reviews: any[] = [];
  const overallRating = property.broker?.rating || 0;

  return {
    id: apiListing.id,
    title,
    purpose: purpose as ListingPurpose,
    propertyType,
    price: priceAmount,
    priceLabel,
    location,
    latitude,
    longitude,
    status,
    brokerId,
    bedrooms,
    bathrooms,
    area: String(area),
    image,
    imageUrl: imageUrl || undefined,
    gallery,
    overallRating,
    description,
    features: Array.isArray(features) ? features : [],
    amenities: Array.isArray(amenities) ? amenities : [],
    reviews,
  };
}

async function ListingsPageContent({ searchParams }: { searchParams: SearchParams }) {
  try {
    const apiData = await fetchListings(searchParams);
    const apiListings = apiData.listings || [];
    const listings: Listing[] = apiListings.map(transformApiListingToMock);
    const pagination = apiData.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  return (
      <ListingsClient 
        initialListings={listings}
        initialPagination={pagination}
        searchParams={searchParams}
      />
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border-2 border-rose-200 bg-rose-50 p-8 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h2 className="text-xl font-semibold text-rose-900">Failed to load listings</h2>
                <p className="text-sm text-rose-700 mt-1">
                  {error instanceof Error ? error.message : "An unexpected error occurred while fetching listings."}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <a
                href="/listings"
                className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
              >
                Try again
              </a>
            </div>
              </div>
            </div>
          </div>
    );
  }
  }

export default function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading listings...</p>
          </div>
        </div>
      }
    >
      <ListingsPageContent searchParams={searchParams} />
    </Suspense>
  );
}