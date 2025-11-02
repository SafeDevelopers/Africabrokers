"use client";

import Link from "next/link";
import { useState } from "react";
import { ListingImage } from "../../../components/listing-image";
import { getListingById } from "../../../data/mock-data";

const sampleListing = getListingById("listing-1");

const propertyTypes = [
  "Apartment",
  "Villa / House",
  "Townhouse",
  "Office",
  "Retail space",
  "Warehouse",
  "Co-working"
];

const purposeOptions = ["Rent", "Sale"] as const;
const statusOptions = ["Draft", "Submitted", "Published"] as const;

type ListingFormState = {
  title: string;
  purpose: (typeof purposeOptions)[number];
  propertyType: string;
  price: string;
  priceFrequency: "per month" | "per year" | "total";
  location: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  description: string;
  amenities: string[];
  status: (typeof statusOptions)[number];
  availabilityDate: string;
  media: {
    heroUrl: string;
    gallery: string[];
  };
};

const initialForm: ListingFormState = {
  title: "",
  purpose: "Rent",
  propertyType: "",
  price: "",
  priceFrequency: "per month",
  location: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  description: "",
  amenities: [],
  status: "Draft",
  availabilityDate: "",
  media: {
    heroUrl: "",
    gallery: []
  }
};

const amenityOptions = [
  "Parking",
  "Generator",
  "Elevator",
  "Security 24/7",
  "Fiber internet",
  "Furnished",
  "Balcony",
  "Garden",
  "Gym access"
];

export default function NewPropertyPage() {
  const [form, setForm] = useState<ListingFormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const actionLabel =
    form.status === "Draft"
      ? "Save draft"
      : form.status === "Submitted"
      ? "Submit for verification"
      : "Publish listing";

  const updateField = <K extends keyof ListingFormState>(field: K, value: ListingFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  const handleSubmit = () => {
    const validationErrors: string[] = [];
    if (!form.title) validationErrors.push("Property title is required.");
    if (!form.propertyType) validationErrors.push("Select a property type.");
    if (!form.price) validationErrors.push("Enter a price.");
    if (!form.location) validationErrors.push("Location is required.");
    if (!form.description) validationErrors.push("Add a description for the listing.");

    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 pb-20">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm text-primary">Broker tools</p>
            <h1 className="text-4xl font-bold text-slate-900">Create a new listing</h1>
            <p className="text-sm text-slate-600">
              Capture every detail to help renters and buyers make confident decisions. Drafts can be saved
              and submitted for verification once your media and property details are complete.
            </p>
          </div>
          <Link
            href="/broker/dashboard"
            className="inline-flex items-center rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-screen-2xl flex-col gap-10 px-6 lg:flex-row">
        <section className="flex-1 space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {errors.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <p className="font-semibold">Fix the following</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                ✅
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {form.status === "Draft"
                  ? "Listing saved as draft"
                  : form.status === "Submitted"
                  ? "Listing submitted for review"
                  : "Listing published"}
              </h2>
              <p className="text-sm text-slate-600">
                {form.status === "Draft"
                  ? "Your property is saved as a draft. Visit the broker dashboard to submit it for verification or continue editing."
                  : form.status === "Submitted"
                  ? "Your listing is on its way to the AfriBrok verification team. Expect a confirmation within 48 hours."
                  : "Your listing is marked as published in this mock flow. When connected to live data it will appear on the marketplace."}
              </p>
              <Link
                href="/broker/dashboard"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Return to dashboard
              </Link>
            </div>
          ) : (
            <>
              <FormSection title="Basic details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Property title" required>
                    <input
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                      placeholder="Modern 3BR Apartment in Bole"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </FormField>
                  <FormField label="Listing purpose" required>
                    <select
                      value={form.purpose}
                      onChange={(event) => updateField("purpose", event.target.value as ListingFormState["purpose"])}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      {purposeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Property type" required>
                    <select
                      value={form.propertyType}
                      onChange={(event) => updateField("propertyType", event.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="">Select type</option>
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Listing status" required>
                    <select
                      value={form.status}
                      onChange={(event) => updateField("status", event.target.value as ListingFormState["status"])}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-[2fr,1fr]">
                  <FormField label="Price" required>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={form.price}
                        onChange={(event) => updateField("price", event.target.value)}
                        placeholder="25000"
                        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                      />
                      <select
                        value={form.priceFrequency}
                        onChange={(event) =>
                          updateField("priceFrequency", event.target.value as ListingFormState["priceFrequency"])
                        }
                        className="rounded-lg border border-slate-200 px-3 py-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                      >
                        <option value="per month">per month</option>
                        <option value="per year">per year</option>
                        <option value="total">total</option>
                      </select>
                    </div>
                  </FormField>
                  <FormField label="Available from">
                    <input
                      type="date"
                      value={form.availabilityDate}
                      onChange={(event) => updateField("availabilityDate", event.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </FormField>
                </div>

                <FormField label="Location (neighborhood, city)" required>
                  <input
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="Bole, Addis Ababa"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Bedrooms">
                    <input
                      type="number"
                      value={form.bedrooms}
                      onChange={(event) => updateField("bedrooms", event.target.value)}
                      placeholder="3"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </FormField>
                  <FormField label="Bathrooms">
                    <input
                      type="number"
                      value={form.bathrooms}
                      onChange={(event) => updateField("bathrooms", event.target.value)}
                      placeholder="2"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </FormField>
                  <FormField label="Area (sq m)">
                    <input
                      type="text"
                      value={form.area}
                      onChange={(event) => updateField("area", event.target.value)}
                      placeholder="120"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </FormField>
                </div>

                <FormField label="Property description" required>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Highlight the key features, nearby amenities, and suitable tenants or buyers."
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </FormField>
              </FormSection>

              <FormSection title="Amenities & features">
                <p className="text-xs text-slate-500">Select all that apply to this property.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {amenityOptions.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium transition ${
                        form.amenities.includes(amenity)
                          ? "bg-primary text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      aria-pressed={form.amenities.includes(amenity)}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </FormSection>

              <FormSection title="Media and assets">
                <div className="grid gap-4 sm:grid-cols-[2fr,1fr]">
                  <FormField label="Hero image URL">
                    <input
                      value={form.media.heroUrl}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          media: { ...prev.media, heroUrl: event.target.value }
                        }))
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Provide a high-resolution landscape photo. This appears on both the marketplace and detail
                      page.
                    </p>
                  </FormField>

                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">Media tips</p>
                    <ul className="space-y-1">
                      <li>• Upload at least 5 photos showcasing interior and exterior.</li>
                      <li>• Include floor plans for commercial listings.</li>
                      <li>• Landscape orientation recommended (1200x900).</li>
                    </ul>
                  </div>
                </div>

                <GalleryPreview gallery={form.media.gallery} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Upload images
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Generate QR flyer
                  </button>
                </div>
              </FormSection>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setForm(initialForm)}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Clear form
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                  {actionLabel}
                </button>
              </div>
            </>
          )}
        </section>

        <aside className="hidden w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:block lg:w-96">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Marketplace preview
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Listing cards update as you add details. Use this preview to gauge presentation quality.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50">
            {sampleListing ? (
              <ListingImage listing={sampleListing} className="rounded-t-2xl" />
            ) : null}
            <div className="space-y-3 p-4 text-sm text-slate-700">
              <p className="text-xs uppercase text-slate-500">Example listing</p>
              <p className="text-base font-semibold text-slate-900">
                {form.title || "Modern 3BR Apartment in Bole"}
              </p>
              <p className="text-xs text-slate-500">{form.location || "Addis Ababa"}</p>
              <p className="text-sm font-semibold text-primary">
                {form.price ? `ETB ${form.price} ${form.priceFrequency}` : "ETB 25,000 per month"}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{form.bedrooms ? `${form.bedrooms} bed` : "3 bed"}</span>
                <span>{form.bathrooms ? `${form.bathrooms} bath` : "2 bath"}</span>
                <span>{form.area ? `${form.area} sq m` : "120 sq m"}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Approval checklist</p>
            <ul className="space-y-2">
              <li>• Hero photo meets quality guidelines</li>
              <li>• Pricing includes currency and frequency</li>
              <li>• Amenities list highlights unique perks</li>
              <li>• Description outlines visit requirements</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="block font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function GalleryPreview({ gallery }: { gallery: string[] }) {
  if (gallery.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No gallery images yet. Add URLs or upload files to build the carousel.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {gallery.map((url, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`Gallery ${index + 1}`} className="h-28 w-full object-cover" />
        </div>
      ))}
    </div>
  );
}
