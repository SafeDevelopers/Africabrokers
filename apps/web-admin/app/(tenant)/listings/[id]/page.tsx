import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api-server";
import {
  formatCurrency,
  formatDateTime,
  getListingStatusColor,
  getListingStatusLabel,
  getPropertyTypeLabel,
} from "@afribrok/lib";

type ListingResponse = {
  id: string;
  priceAmount: string | number;
  priceCurrency: string;
  availabilityStatus: string;
  featured: boolean;
  channels: Record<string, boolean>;
  attrs: Record<string, unknown> | null;
  property: {
    id: string;
    type: string;
    address: Record<string, unknown> | string | null;
    verificationStatus: string;
    description?: string | null;
    broker?: {
      id: string;
      licenseNumber: string;
      status: string;
      rating: number | null;
    } | null;
  } | null;
  publishedAt: string | null;
  createdAt: string;
};

type BrokerResponse = {
  id: string;
  licenseNumber: string;
  status: string;
  licenseDocs: Record<string, unknown> | null;
  user: {
    id: string;
    email: string;
    role: string;
  };
  qrCode?: {
    id: string;
    status: string;
  } | null;
};

const statusStyles: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
};

const safeNumber = (value: string | number | null | undefined): number | null => {
  if (value == null) return null;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // ignore malformed JSON
    }
  }
  return {};
};

async function getListing(id: string): Promise<ListingResponse> {
  try {
    return await apiRequest<ListingResponse>(`/v1/listings/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    throw error;
  }
}

async function getBroker(id: string): Promise<BrokerResponse | null> {
  try {
    return await apiRequest<BrokerResponse>(`/v1/brokers/${id}`);
  } catch (error) {
    console.warn(`Failed to load broker ${id}:`, error);
    return null;
  }
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  const attrs = toRecord(listing.attrs);
  const property = listing.property;
  const address = property ? toRecord(property.address) : {};
  const priceAmount = safeNumber(listing.priceAmount);
  const brokerId = property?.broker?.id;
  const broker = brokerId ? await getBroker(brokerId) : null;

  const title =
    (attrs.title as string | undefined) ||
    (typeof address.street === "string" && address.street) ||
    `${getPropertyTypeLabel(property?.type ?? "Property")} ${address.city ?? ""}`.trim() ||
    "Listing details";

  const description =
    (attrs.description as string | undefined) ||
    (typeof property?.["description"] === "string" ? (property["description"] as string) : undefined) ||
    "No description provided yet.";

  const features = Array.isArray(attrs.features) ? (attrs.features as string[]) : [];
  const amenities = Array.isArray(attrs.amenities) ? (attrs.amenities as string[]) : [];
  const gallery = Array.isArray(attrs.gallery) ? (attrs.gallery as string[]) : [];
  const channels = listing.channels || {};

  const statusLabel = getListingStatusLabel(listing.availabilityStatus);
  const statusColor = statusStyles[getListingStatusColor(listing.availabilityStatus)] ?? statusStyles.gray;

  const locationParts = [address.street, address.district, address.city, address.country]
    .filter((part): part is string => typeof part === "string" && part.length > 0);
  const location = locationParts.join(", ") || "Location not provided";

  const brokerName =
    (broker?.licenseDocs?.["businessName"] as string | undefined) ||
    (broker?.user?.email ?? "Broker profile");

  const moderationDisabled = listing.availabilityStatus !== "pending_review";

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Listing Details</h1>
              <p className="text-sm text-gray-500">Moderate, approve, and manage listing content</p>
            </div>
            <Link href="/listings" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to Listings
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Listing ID</p>
                <p className="font-semibold text-gray-900">{listing.id}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
                  {statusLabel}
                </span>
                {listing.featured ? (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Featured
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>{getPropertyTypeLabel(property?.type ?? "Property")}</span>
                  <span>•</span>
                  <span>{location}</span>
                  {listing.createdAt ? (
                    <>
                      <span>•</span>
                      <span>Created {formatDateTime(listing.createdAt)}</span>
                    </>
                  ) : null}
                </div>
              </div>

              {gallery.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {gallery.slice(0, 3).map((url, index) => (
                    <div key={url ?? index} className="overflow-hidden rounded-lg border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={String(url)} alt={`Listing media ${index + 1}`} className="h-36 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                  No media uploaded yet.
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">Pricing</h3>
                  <dl className="space-y-1 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <dt>Amount</dt>
                      <dd className="font-semibold">
                        {priceAmount != null ? formatCurrency(priceAmount, listing.priceCurrency) : "—"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Currency</dt>
                      <dd>{listing.priceCurrency}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Channels</dt>
                      <dd>
                        {Object.keys(channels).length
                          ? Object.entries(channels)
                              .filter(([, enabled]) => Boolean(enabled))
                              .map(([channel]) => channel)
                              .join(", ") || "—"
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">Broker</h3>
                  {broker ? (
                    <dl className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center justify-between">
                        <dt>Name</dt>
                        <dd className="font-semibold">{brokerName}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>License</dt>
                        <dd>{broker.licenseNumber}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>Status</dt>
                        <dd className="capitalize">{broker.status.replace("_", " ")}</dd>
                      </div>
                      <Link
                        href={`/brokers/${broker.id}`}
                        className="inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View broker profile →
                      </Link>
                    </dl>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No broker assigned. Confirm the property owner before publishing.
                    </p>
                  )}
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Description</h3>
                <p className="text-sm leading-6 text-gray-700">{description}</p>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Features</h3>
                  {features.length ? (
                    <ul className="mt-2 space-y-2 text-sm text-gray-700">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-1 text-indigo-500">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No features documented.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Amenities</h3>
                  {amenities.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2 text-xs text-indigo-700">
                      {amenities.map((amenity) => (
                        <li key={amenity} className="rounded-full bg-indigo-50 px-3 py-1 font-medium">
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No amenities captured.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Moderation</h3>
              <div className="mt-3 space-y-2">
                <button
                  className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={moderationDisabled}
                >
                  Approve
                </button>
                <button
                  className="w-full rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={moderationDisabled}
                >
                  Request Changes
                </button>
                <button
                  className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={moderationDisabled}
                >
                  Reject
                </button>
              </div>
              {moderationDisabled ? (
                <p className="mt-3 text-xs text-gray-500">
                  Listing is not awaiting review. Actions become available when status is <strong>pending_review</strong>.
                </p>
              ) : null}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Logistics</h3>
              <dl className="mt-3 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <dt>Verification</dt>
                  <dd className="capitalize">{property?.verificationStatus ?? "pending"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Published</dt>
                  <dd>{listing.publishedAt ? formatDateTime(listing.publishedAt) : "Not published"}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
