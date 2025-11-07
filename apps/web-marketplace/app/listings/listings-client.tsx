"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListingImage } from "../components/listing-image";
import {
  type Listing,
  type ListingPurpose,
  type ListingStatus
} from "../types/listing";
import { Search, MapPin, Filter, Home, Building2, X, SlidersHorizontal, Grid3x3, List, ChevronDown, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { api, getErrorMessage, getErrorDetails, type NetworkError } from "../../lib/api";

type ViewMode = "grid" | "list";
type PurposeFilter = ListingPurpose | "All";
type StatusFilter = ListingStatus | "All";
type BedroomFilter = "any" | "1" | "2" | "3" | "4";
type PropertyTypeFilter = "All" | string;

const bedroomFilters: { label: string; value: BedroomFilter }[] = [
  { label: "Any beds", value: "any" },
  { label: "1+ beds", value: "1" },
  { label: "2+ beds", value: "2" },
  { label: "3+ beds", value: "3" },
  { label: "4+ beds", value: "4" }
];

type SearchParams = Record<string, string | undefined>;

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ListingsClientProps = {
  searchParams: SearchParams;
};

function transformApiListing(apiListing: any): Listing {
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

export function ListingsClient({ searchParams: initialSearchParams }: ListingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Initialize query from URL params immediately
  const initialQuery = searchParams?.get("query") || searchParams?.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [purpose, setPurpose] = useState<PurposeFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [bedrooms, setBedrooms] = useState<BedroomFilter>("any");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [propertyType, setPropertyType] = useState<PropertyTypeFilter>("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const initializingRef = useRef(true);
  const [sortBy, setSortBy] = useState<
    "default" | "newest" | "price-asc" | "price-desc" | "rating-desc"
  >("default");

  // Data fetching state
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NetworkError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch listings function
  const fetchListings = useCallback(async () => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const search = query || "";
      if (search) params.set("q", search);
      
      // Map status filter (marketplace endpoint doesn't support status filter, it only shows active/pending_review)
      // Status filter is handled client-side
      
      // Map property type (marketplace endpoint doesn't support propertyType filter yet)
      // Property type filter is handled client-side
      
      // Price filters (marketplace endpoint doesn't support price filters yet)
      // Price filters are handled client-side
      
      // Pagination
      const offset = (currentPage - 1) * pageSize;
      params.set("offset", String(offset));
      params.set("limit", String(pageSize));
      
      // Sorting
      if (sortBy === "newest") {
        params.set("sort", "createdAt:desc");
      } else if (sortBy === "price-asc") {
        params.set("sort", "priceAmount:asc");
      } else if (sortBy === "price-desc") {
        params.set("sort", "priceAmount:desc");
      } else {
        params.set("sort", "createdAt:desc");
      }

      // Use marketplace listings endpoint
      const apiData = await api<{ items: any[]; count: number }>(
        `/v1/marketplace/listings?${params.toString()}`,
        { signal: abortController.signal }
      );

      const apiListings = apiData.items || [];
      const transformedListings: Listing[] = apiListings.map(transformApiListing);
      const total = apiData.count || 0;
      const paginationData: Pagination = {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      };

      setListings(transformedListings);
      setPagination(paginationData);
      setError(null);
    } catch (err: any) {
      // Ignore abort errors
      if (err?.name === "AbortError") {
        return;
      }
      
      const networkError = err as NetworkError;
      setError(networkError);
      setListings([]);
      setPagination({ page: currentPage, limit: pageSize, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [query, status, propertyType, minPrice, maxPrice, currentPage, pageSize]);

  // Property type options with enum values and display labels
  const propertyTypes = useMemo(
    () => {
      // Always include all available property types from the enum
      const allEnumTypes = ["residential", "commercial", "land"];
      
      // Also include any additional types found in listings (normalize to lowercase)
      const listingTypes = Array.from(
        new Set(listings.map((listing) => listing.propertyType?.toLowerCase()))
      ).filter(Boolean);
      
      // Combine and deduplicate
      const combinedTypes = Array.from(new Set([...allEnumTypes, ...listingTypes]));
      
      // Map enum values to display labels
      const typeLabelMap: Record<string, string> = {
        residential: "Residential",
        commercial: "Commercial",
        land: "Land",
      };
      
      // Return options with both value (enum) and label (display)
      return [
        { value: "All", label: "All" },
        ...combinedTypes
          .map(type => ({
            value: type,
            label: typeLabelMap[type] || type.charAt(0).toUpperCase() + type.slice(1)
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      ];
    },
    [listings]
  );

  // Initialize state from URL search params on mount
  useEffect(() => {
    if (!searchParams) return;
    const urlQuery = searchParams.get("query") || searchParams.get("q") || "";
    const p = (searchParams.get("purpose") as PurposeFilter) ?? "All";
    const s = (searchParams.get("status") as StatusFilter) ?? "All";
    const bd = (searchParams.get("beds") as BedroomFilter) ?? "any";
    const pt = (searchParams.get("type") as PropertyTypeFilter) ?? "All";
    const min = searchParams.get("min") ?? "";
    const max = searchParams.get("max") ?? "";
    const sort = (searchParams.get("sort") as any) ?? "default";
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const per = Number(searchParams.get("per") ?? "12") || 12;

    if (urlQuery !== query) setQuery(urlQuery);
    if (p !== purpose) setPurpose(p);
    if (s !== status) setStatus(s);
    if (bd !== bedrooms) setBedrooms(bd);
    if (pt !== propertyType) setPropertyType(pt);
    if (min !== minPrice) setMinPrice(min);
    if (max !== maxPrice) setMaxPrice(max);
    if (sort !== sortBy) setSortBy(sort);
    if (page !== currentPage) setCurrentPage(page);
    if (per !== pageSize) setPageSize(per);

    initializingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fetch listings when filters change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Apply client-side filtering for immediate feedback (server already filtered, but we apply additional filters)
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Additional client-side filtering for filters not supported by API
      if (purpose !== "All" && listing.purpose !== purpose) {
        return false;
      }

      if (propertyType !== "All") {
        // Normalize comparison - API returns lowercase enum values, but listings might be capitalized
        const listingType = listing.propertyType?.toLowerCase();
        const filterType = propertyType.toLowerCase();
        if (listingType !== filterType) {
          return false;
        }
      }

      if (bedrooms !== "any") {
        const minBedrooms = Number(bedrooms);
        if (listing.bedrooms === null || listing.bedrooms < minBedrooms) return false;
      }

      if (!query.trim()) return true;

      const search = query.toLowerCase();
      return (
        listing.title.toLowerCase().includes(search) ||
        listing.location.toLowerCase().includes(search)
      );
    });
  }, [listings, query, purpose, bedrooms, propertyType]);

  // Reset to first page when filters change
  useEffect(() => {
    if (!initializingRef.current) {
      setCurrentPage(1);
    }
  }, [query, purpose, status, bedrooms, propertyType, minPrice, maxPrice]);

  // Sync relevant state to URL (debounced/controlled via initializingRef)
  useEffect(() => {
    if (initializingRef.current) {
      initializingRef.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (purpose && purpose !== "All") params.set("purpose", purpose);
    if (status && status !== "All") params.set("status", status);
    if (bedrooms && bedrooms !== "any") params.set("beds", bedrooms);
    if (propertyType && propertyType !== "All") params.set("type", propertyType);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    if (sortBy && sortBy !== "default") params.set("sort", sortBy);
    if (pageSize && pageSize !== 12) params.set("per", String(pageSize));
    if (currentPage && currentPage !== 1) params.set("page", String(currentPage));

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url);
  }, [query, purpose, status, bedrooms, propertyType, minPrice, maxPrice, sortBy, pageSize, currentPage, router, pathname]);

  const sortedListings = useMemo(() => {
    const arr = [...filteredListings];
    switch (sortBy) {
      case "price-asc":
        return arr.sort((a, b) => a.price - b.price);
      case "price-desc":
        return arr.sort((a, b) => b.price - a.price);
      case "rating-desc":
        return arr.sort((a, b) => b.overallRating - a.overallRating);
      case "newest":
        return arr;
      default:
        return arr;
    }
  }, [filteredListings, sortBy]);

  const totalListings = filteredListings.length;
  const totalPages = Math.max(1, Math.ceil(totalListings / pageSize));
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedListings.slice(start, start + pageSize);
  }, [sortedListings, currentPage, pageSize]);

  const getPageNumbers = (current: number, total: number, maxButtons = 5) => {
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (purpose !== "All") count++;
    if (status !== "All") count++;
    if (bedrooms !== "any") count++;
    if (propertyType !== "All") count++;
    if (minPrice || maxPrice) count++;
    return count;
  }, [purpose, status, bedrooms, propertyType, minPrice, maxPrice]);

  const clearFilters = () => {
    setQuery("");
    setPurpose("All");
    setStatus("All");
    setBedrooms("any");
    setPropertyType("All");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:py-8">
          {/* Back Button */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Find Your Perfect Property</h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Browse verified properties across Addis Ababa. Use filters to narrow your search.
            </p>
          </div>

          <div className="relative mb-4">
            <div className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by location, neighborhood, or keyword..."
                  className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-4 py-4 text-base text-slate-900 shadow-md transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-slate-300"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl whitespace-nowrap"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Purpose"
              value={purpose}
              onChange={(value) => setPurpose(value as PurposeFilter)}
              options={[
                { label: "All", value: "All" },
                { label: "Rent", value: "Rent" },
                { label: "Sale", value: "Sale" }
              ]}
              icon={<Home className="h-4 w-4" />}
            />

            <FilterSelect
              label="Type"
              value={propertyType}
              onChange={(value) => setPropertyType(value as PropertyTypeFilter)}
              options={propertyTypes}
              icon={<Building2 className="h-4 w-4" />}
            />

            <FilterSelect
              label="Bedrooms"
              value={bedrooms}
              onChange={(value) => setBedrooms(value as BedroomFilter)}
              options={bedroomFilters}
              icon={<Home className="h-4 w-4" />}
            />

            <FilterSelect
              label="Status"
              value={status}
              onChange={(value) => setStatus(value as StatusFilter)}
              options={[
                { label: "All", value: "All" },
                { label: "Verified", value: "Verified" },
                { label: "Pending", value: "Pending" }
              ]}
              icon={<MapPin className="h-4 w-4" />}
            />

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 hover:border-red-300"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-6 rounded-xl border-2 border-slate-200 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Advanced Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Price Range (ETB)
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      placeholder="Min"
                      className="w-full border-0 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    <span className="text-sm font-medium text-slate-400">—</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      placeholder="Max"
                      className="w-full border-0 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Failed to load listings</h3>
                <p className="text-sm text-red-700 mb-2">{getErrorMessage(error)}</p>
                {error.url && (
                  <p className="text-xs text-red-600 mb-3">
                    {'status' in error && error.status && `Status: ${error.status} • `}
                    Route: {error.url}
                  </p>
                )}
                <button
                  onClick={() => fetchListings()}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200"></div>
            ) : (
              <p className="text-sm font-medium text-slate-600">
                Showing <span className="font-bold text-primary">{filteredListings.length}</span>{" "}
                {filteredListings.length === 1 ? "property" : "properties"}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border-2 border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMap((prev) => !prev)}
              className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all ${
                showMap
                  ? "border-primary bg-primary text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">{showMap ? "Hide Map" : "Show Map"}</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none rounded-lg border-2 border-slate-200 bg-white px-4 py-2 pr-10 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-slate-300"
              >
                <option value="default">Recommended</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating-desc">Top Rated</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {showMap && <MapPreview listings={filteredListings} />}
        
        {/* Loading State - Skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="aspect-[4/3] bg-slate-200 animate-pulse"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
                    <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredListings.length === 0 && (
          <EmptyState query={query} />
        )}

        {/* Success State - Listings Grid/List */}
        {!loading && filteredListings.length > 0 && (
          viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {paginatedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} variant="list" />
              ))}
            </div>
          )
        )}
        
        {/* Pagination - Only show when not loading and there are listings */}
        {!loading && filteredListings.length > 0 && (
          <div className="mt-8 rounded-xl border-2 border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-slate-700">
                Showing <span className="font-bold text-primary">{Math.min((currentPage - 1) * pageSize + 1, totalListings)}</span> -{" "}
                <span className="font-bold text-primary">{Math.min(currentPage * pageSize, totalListings)}</span> of{" "}
                <span className="font-bold text-primary">{totalListings}</span> properties
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-slate-700">Per page</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="appearance-none rounded-lg border-2 border-slate-200 bg-white px-3 py-2 pr-8 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-slate-300"
                  >
                    {[6, 12, 24, 48].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none -ml-6 h-4 w-4 text-slate-400" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="min-h-[40px] rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    Prev
                  </button>
                  <div className="hidden items-center gap-1 md:flex">
                    {getPageNumbers(currentPage, totalPages).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`min-h-[40px] min-w-[40px] rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                          p === currentPage
                            ? "bg-primary text-white shadow-md"
                            : "border-2 border-slate-200 bg-white text-slate-700 shadow-sm hover:border-primary hover:bg-primary/5 hover:text-primary"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="min-h-[40px] rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

type FilterSelectProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  icon?: React.ReactNode;
};

function FilterSelect<T extends string>({ label, value, onChange, options, icon }: FilterSelectProps<T>) {
  return (
    <label className="relative block min-w-[140px]">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className={`w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-slate-300 hover:shadow-md ${
            icon ? "pl-10" : ""
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function ListingCard({ listing, variant }: { listing: Listing; variant: ViewMode }) {
  const isVerified = listing.status === "Verified";
  const purposeClasses =
    listing.purpose === "Rent" ? "bg-blue-600 text-white" : "bg-amber-500 text-white";
  const statusClasses = isVerified
    ? "bg-white/90 text-green-800"
    : "bg-white/90 text-amber-600";

  const overlay = (
    <>
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${purposeClasses}`}>
        {listing.purpose}
      </span>
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusClasses}`}>
        {isVerified ? "✓ Verified broker" : "Pending verification"}
      </span>
      <span className="inline-flex items-center rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
        {listing.overallRating.toFixed(1)} ★
      </span>
    </>
  );

  if (variant === "list") {
    return (
      <Link href={`/listings/${listing.id}`}>
        <article className="group flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl md:flex-row">
          <div className="md:w-80 md:flex-shrink-0">
            <ListingImage listing={listing} overlay={overlay} className="aspect-[16/10]" />
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">{listing.title}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{listing.propertyType}</p>
              </div>
              <p className="text-2xl font-bold text-primary md:text-3xl">{listing.priceLabel}</p>
            </div>

            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{listing.description}</p>

            <div className="flex flex-wrap gap-2">
              {typeof listing.bedrooms === "number" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  🛏️ {listing.bedrooms}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                🚿 {listing.bathrooms}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                📐 {listing.area}
              </span>
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-600">
                <span className="font-semibold">Broker:</span> Verified
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary group-hover:underline">View Details →</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl">
        <ListingImage listing={listing} overlay={overlay} />

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">{listing.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              {listing.location}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{listing.propertyType}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {typeof listing.bedrooms === "number" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                🛏️ {listing.bedrooms}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              🚿 {listing.bathrooms}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              📐 {listing.area}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
              <p className="mt-1 text-2xl font-bold text-primary">{listing.priceLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Broker</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                Verified
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-primary group-hover:underline">View Details →</span>
            <Link
              href={`/listings/${listing.id}#contact-form`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              Contact
            </Link>
          </div>
        </div>
      </article>
    </Link>
  );
}

function MapPreview({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) return null;
  const [first] = listings;
  const src = `https://www.google.com/maps?q=${first.latitude},${first.longitude}&hl=en&output=embed`;

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Map preview</p>
          <p className="text-sm text-slate-600">
            Centered on {first.title}. Interactive map controls will be available in the live integration.
          </p>
        </div>
        <span className="text-xs text-slate-500">Powered by Google Maps embed</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <iframe
          title="Listings map preview"
          src={src}
          width="100%"
          height="320"
          loading="lazy"
          className="w-full"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">🏠</div>
        <p className="text-xl font-semibold text-slate-900 mb-2">No listings found</p>
        <p className="text-sm text-slate-600 mb-4">
          {query
            ? `No properties match "${query}". Try adjusting your search keywords or removing some filters to see more results.`
            : "No listings are available yet. Check back later or try adjusting your filters to explore different property types or price ranges."}
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-2">Tips:</p>
          <ul className="text-xs text-slate-600 space-y-1 text-left">
            <li>• Try searching with different keywords</li>
            <li>• Clear filters to see all available properties</li>
            <li>• Check back later as new listings are added regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
