import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingImage } from "../../components/listing-image";
import { ContactBrokerForm } from "../../components/contact-broker-form";
import { BrokerCard } from "../../components/broker/BrokerCard";
import { ScrollToContact } from "./scroll-to-contact";
import { type Listing, type ListingReview } from "../../data/mock-data";

type ListingDetailPageProps = {
  params: {
    id: string;
  };
};

async function fetchListing(id: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
  const tenantKey = process.env.NEXT_PUBLIC_TENANT_KEY;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_CORE_API_BASE_URL is not configured");
  }
  if (!tenantKey) {
    throw new Error("NEXT_PUBLIC_TENANT_KEY is not configured");
  }

  const url = `${apiBaseUrl}/v1/listings/${id}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "X-Tenant": tenantKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch listing: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching listing:", error);
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
  const status = verificationStatus === "verified" ? "Verified" : "Pending";
  
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
  const reviews: ListingReview[] = [];
  const overallRating = property.broker?.rating || 0;

  return {
    id: apiListing.id,
    title,
    purpose: purpose as "Rent" | "Sale",
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

async function fetchBroker(id: string) {
  if (!id) return null;
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
  const tenantKey = process.env.NEXT_PUBLIC_TENANT_KEY;

  if (!apiBaseUrl || !tenantKey) return null;

  try {
    const url = `${apiBaseUrl}/v1/brokers/${id}`;
    const response = await fetch(url, {
      headers: {
        "X-Tenant": tenantKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching broker:", error);
    return null;
  }
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  try {
    const apiListing = await fetchListing(params.id);

    if (!apiListing) {
      notFound();
    }

    const listing = transformApiListingToMock(apiListing);
    const broker = listing.brokerId ? await fetchBroker(listing.brokerId) : null;

    const hasReviews = listing.reviews.length > 0;
    const reviewAverage = hasReviews
      ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
      : 0;

    // Transform broker data if available
    const brokerName = broker ? (broker.user?.name || broker.licenseDocs?.businessName || "Unknown") : undefined;
    const brokerEmail = broker?.user?.email || undefined;
    const brokerPhone = broker?.user?.phone || undefined;
    const brokerAvatar = broker?.user?.avatar || "👤";
    const brokerCompany = broker?.licenseDocs?.businessName || brokerName || "";

    return (
      <div className="bg-slate-50 pb-20">
        <ScrollToContact />
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-6 py-8">
            <nav className="text-xs text-slate-500">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>{" "}
              /{" "}
              <Link href="/listings" className="hover:text-primary">
                Listings
              </Link>{" "}
              / <span className="text-slate-700">{listing.title}</span>
            </nav>
            <div className="space-y-3">
              <p className="text-sm text-primary">{listing.propertyType}</p>
              <h1 className="text-4xl font-bold text-slate-900">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>📍 {listing.location}</span>
                <span>•</span>
                <span>{listing.area}</span>
                {listing.bedrooms ? (
                  <>
                    <span>•</span>
                    <span>{listing.bedrooms} bedrooms</span>
                  </>
                ) : null}
                <span>•</span>
                <span>{listing.bathrooms} bathrooms</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto mt-8 flex max-w-screen-2xl flex-col gap-6 px-6 lg:flex-row">
          <section className="flex-1 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <ListingImage
              listing={listing}
              className="aspect-[16/9] rounded-2xl"
              overlay={
                <>
                  <span className="rounded-full bg-primary text-xs font-semibold text-white px-3 py-1">
                    {listing.purpose}
                  </span>
                  <span className="rounded-full bg-white/90 text-xs font-semibold text-slate-700 px-3 py-1">
                    {listing.status === "Verified" ? "Verified listing" : "Pending verification"}
                  </span>
                </>
              }
            />

            {listing.gallery.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {listing.gallery.slice(0, 3).map((url, index) => (
                  <div key={url} className="overflow-hidden rounded-2xl border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${listing.title} gallery image ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4 md:divide-x md:divide-slate-200">
              <InfoStat label="Price" value={listing.priceLabel} accent />
              <InfoStat
                label="Overall rating"
                value={hasReviews ? `${reviewAverage.toFixed(1)} / 5` : "No reviews yet"}
                helper={hasReviews ? `${listing.reviews.length} reviews` : "Be the first to review"}
              />
              <InfoStat
                label="Availability"
                value={listing.status === "Verified" ? "Available now" : "Awaiting review"}
                helper={listing.purpose === "Rent" ? "Flexible lease terms" : "Sale"}
              />
              <InfoStat label="Broker" value={brokerName || "Unknown broker"} helper={broker?.user?.location || ""} />
            </div>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">About this property</h2>
              <p className="text-sm leading-6 text-slate-600">{listing.description}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Key features</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    {listing.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 text-primary">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Amenities</h3>
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs text-primary">
                    {listing.amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="rounded-full bg-primary/10 px-3 py-1 font-medium"
                      >
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">Location</h2>
              <p className="text-sm text-slate-600">
                Explore the surrounding area to confirm commute routes, amenities, and neighborhood vibe. Switch to satellite mode on mobile for a closer look.
              </p>
              <MapEmbed listing={listing} />
            </section>

            <section className="space-y-4">
              <header className="flex flex-wrap items-center gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
                  <p className="text-xs text-slate-500">
                    {hasReviews ? `Average rating ${reviewAverage.toFixed(1)} / 5 from ${listing.reviews.length} clients.` : "No verified reviews yet."}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Share your experience
                </button>
              </header>
              <div className="space-y-3">
                {hasReviews ? (
                  listing.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                    Be the first to leave a verified review for this property once you complete a transaction.
                  </p>
                )}
              </div>
            </section>
          </section>

          <aside className="w-full space-y-6 lg:w-96">
            <div id="contact-form" className="scroll-mt-20">
              <ContactBrokerForm 
                listingId={listing.id} 
                listingTitle={listing.title} 
                brokerName={brokerName} 
              />
            </div>
            
            {broker && brokerName && (
              <BrokerCard
                name={brokerName}
                email={brokerEmail}
                phone={brokerPhone}
                avatar={brokerAvatar}
              />
            )}

            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Broker snapshot
              </h3>
              {broker ? (
                <>
                  <p className="text-lg font-semibold text-slate-900">{brokerCompany}</p>
                  <p className="text-sm text-slate-600">{broker.stats?.experience || "Experienced broker"}</p>
                  <p className="text-sm text-slate-600">Response time: {broker.stats?.responseTime || "N/A"}</p>
                  <Link
                    href={`/brokers/${broker.id}`}
                    className="inline-flex text-sm font-semibold text-primary hover:underline"
                  >
                    View full profile →
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  This listing is awaiting broker verification. Use the contact form for more details.
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Share & verify
              </h3>
              <p className="text-sm text-slate-600">
                Download or share the QR code with prospects so they can verify this listing instantly using the AfriBrok Verify tool.
              </p>
              <Link
                href="/verify"
                className="inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Open QR verification →
              </Link>
            </div>
          </aside>
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border-2 border-rose-200 bg-rose-50 p-8 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h2 className="text-xl font-semibold text-rose-900">Failed to load listing</h2>
                <p className="text-sm text-rose-700 mt-1">
                  {error instanceof Error ? error.message : "An unexpected error occurred while fetching the listing."}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/listings"
                className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
              >
                Back to listings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function InfoStat({ label, value, helper, accent }: { label: string; value: string; helper?: string; accent?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-xl font-semibold ${accent ? "text-primary" : "text-slate-900"}`}>{value}</p>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function MapEmbed({ listing }: { listing: Listing }) {
  const src = `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}&hl=en&output=embed`;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <iframe
        title={`Map for ${listing.title}`}
        src={src}
        width="100%"
        height="320"
        loading="lazy"
        allowFullScreen
        className="w-full"
      />
    </div>
  );
}

function ReviewCard({ review }: { review: ListingReview }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{review.author}</p>
          <p className="text-xs text-slate-500">
            {review.relationship} · {review.date}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {review.rating.toFixed(1)} / 5
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
    </article>
  );
}