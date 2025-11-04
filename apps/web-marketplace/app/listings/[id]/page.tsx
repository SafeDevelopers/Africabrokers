import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingImage } from "../../components/listing-image";
import { ContactBrokerForm } from "../../components/contact-broker-form";
import { BrokerCard } from "../../components/broker/BrokerCard";
import { ScrollToContact } from "./scroll-to-contact";
import {
  getListingById,
  getBrokerById,
  type Listing,
  type ListingReview
} from "../../data/mock-data";

type ListingDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const listing = getListingById(params.id);

  if (!listing) {
    notFound();
  }

  const broker = getBrokerById(listing.brokerId);
  const hasReviews = listing.reviews.length > 0;
  const reviewAverage = hasReviews
    ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
    : 0;

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
            <InfoStat label="Broker" value={broker ? broker.name : "Unknown broker"} helper={broker ? broker.location : ""} />
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
              brokerName={broker?.name} 
            />
          </div>
          
          {broker && (
            <BrokerCard
              name={broker.name}
              email={broker.email}
              phone={broker.phone}
              avatar={broker.avatar}
            />
          )}

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Broker snapshot
            </h3>
            {broker ? (
              <>
                <p className="text-lg font-semibold text-slate-900">{broker.company}</p>
                <p className="text-sm text-slate-600">{broker.experience}</p>
                <p className="text-sm text-slate-600">Response time: {broker.stats.responseTime}</p>
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
