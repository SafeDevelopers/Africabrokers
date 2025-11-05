"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Plus, Upload as UploadIcon, X as XIcon,
  Bed, Bath, Car, Square
} from "lucide-react";
import { useAuth } from "../../../context/auth-context";

// ---------- Types ----------
interface AddressData {
  street: string;
  subcity: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
}

type PropertyType = "residential" | "commercial" | "land";
type Purpose = "Sale" | "Rent";
type AreaUnit = "sqm" | "sqft";

interface FormData {
  // Basic
  title: string;
  propertyType: PropertyType;
  propertySubType: string;
  purpose: Purpose;

  // Address + geo
  address: AddressData;
  latitude?: number;
  longitude?: number;

  // Details
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  areaUnit: AreaUnit;
  parking?: number;
  yearBuilt?: number;
  condition: string;
  furnished: boolean;

  // Pricing
  priceAmount: string;        // user input
  priceCurrency: string;      // ETB, USD
  deposit?: string;
  monthlyMaintenance?: string;

  // Features
  features: string[];
  amenities: string[];

  // Description
  description: string;
  highlights: string;

  // Media
  images: File[];
  imageUrls: string[];        // after upload
  floorPlan?: File;
  virtualTourUrl?: string;

  // Contact
  contactPhone?: string;
  contactEmail?: string;
  availableFrom?: string;

  // Flags
  featured: boolean;
}

const initialData: FormData = {
  title: "",
  propertyType: "residential",
  propertySubType: "",
  purpose: "Sale",
  address: {
    street: "",
    subcity: "",
    city: "",
    region: "",
    country: "Ethiopia",
    postalCode: "",
  },
  area: 0,
  areaUnit: "sqm",
  condition: "",
  furnished: false,
  priceAmount: "",
  priceCurrency: "ETB",
  features: [],
  amenities: [],
  description: "",
  highlights: "",
  images: [],
  imageUrls: [],
  featured: false,
};

const propertySubTypes: Record<PropertyType, string[]> = {
  residential: ["Apartment", "House", "Villa", "Studio", "Townhouse", "Condominium", "Penthouse", "Other"],
  commercial: ["Office", "Retail", "Warehouse", "Restaurant", "Hotel", "Mixed-Use", "Other"],
  land: ["Residential Land", "Commercial Land", "Agricultural Land", "Industrial Land", "Other"],
};

const conditionOptions = ["New", "Excellent", "Good", "Fair", "Needs Renovation"];
const commonFeatures = ["Balcony", "Garden", "Swimming Pool", "Gym", "Security", "Parking", "Elevator", "Air Conditioning", "Heating", "Fireplace", "Storage", "Pet Friendly"];
const commonAmenities = ["24/7 Security", "Backup Generator", "High-Speed Internet", "Cable TV", "Water Supply", "Waste Management", "Cleaning Service", "Concierge", "Playground", "Business Center"];

// ---------- Helpers ----------
function getTenantFromCookie(): string {
  if (typeof document === "undefined") return "et-addis";
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("afribrok-tenant="));
  return cookie?.split("=")[1] || "et-addis";
}

const apiBase =
  process.env.NEXT_PUBLIC_CORE_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

// Simple toast
function toast(msg: string, type: "ok" | "err" = "ok") {
  if (type === "err") console.error(msg);
  // Replace with your toast system if you have one
}

// ---------- Component ----------
export default function NewListingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const redirectAttemptedRef = useRef(false);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newFeature, setNewFeature] = useState("");
  const [newAmenity, setNewAmenity] = useState("");

  // Note: Authentication is handled by broker/layout.tsx and middleware
  // The layout checks for ab_broker_session cookie (HTTP-only) and redirects if missing
  // We don't need client-side auth checks here since HTTP-only cookies can't be read client-side
  // The middleware and layout will ensure only authenticated brokers can access this page

  // --- state setters ---
  const updateFormData = (updates: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const updateAddress = (updates: Partial<AddressData>) =>
    setFormData((prev) => ({ ...prev, address: { ...prev.address, ...updates } }));

  // --- media handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const next = [...formData.images, ...files];
    updateFormData({ images: next.slice(0, 20) }); // limit
  };
  const removeImage = (i: number) =>
    updateFormData({ images: formData.images.filter((_, idx) => idx !== i) });

  // --- feature/amenity helpers ---
  const addFeature = () => {
    const v = newFeature.trim();
    if (v && !formData.features.includes(v)) {
      updateFormData({ features: [...formData.features, v] });
      setNewFeature("");
    }
  };
  const toggleFeature = (v: string) =>
    updateFormData({
      features: formData.features.includes(v)
        ? formData.features.filter((x) => x !== v)
        : [...formData.features, v],
    });

  const addAmenity = () => {
    const v = newAmenity.trim();
    if (v && !formData.amenities.includes(v)) {
      updateFormData({ amenities: [...formData.amenities, v] });
      setNewAmenity("");
    }
  };
  const toggleAmenity = (v: string) =>
    updateFormData({
      amenities: formData.amenities.includes(v)
        ? formData.amenities.filter((x) => x !== v)
        : [...formData.amenities, v],
    });

  // --- validation ---
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.propertySubType) e.propertySubType = "Property sub-type is required";
    if (!formData.address.street.trim()) e["address.street"] = "Street address is required";
    if (!formData.address.subcity.trim()) e["address.subcity"] = "Subcity is required";
    if (!formData.address.city.trim()) e["address.city"] = "City is required";
    if (!formData.address.region.trim()) e["address.region"] = "Region is required";
    if (!formData.area || Number(formData.area) <= 0) e.area = "Valid area is required";

    if (formData.propertyType !== "land") {
      if (formData.bathrooms == null || Number(formData.bathrooms) <= 0) {
        e.bathrooms = "Bathrooms is required";
      }
      if (formData.bedrooms == null || Number(formData.bedrooms) < 0) {
        e.bedrooms = "Bedrooms is required (0+)";
      }
    }

    const price = Number(formData.priceAmount);
    if (!formData.priceAmount.trim() || !Number.isFinite(price) || price <= 0) {
      e.priceAmount = "Valid price is required";
    }
    if (!formData.description.trim()) e.description = "Description is required";
    if (formData.images.length === 0) e.images = "At least one image is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- media presign + upload flow ---
  async function presignAndUploadImages(files: File[], tenant: string): Promise<string[]> {
    if (files.length === 0) return [];
    const uploaded: string[] = [];
    for (const f of files) {
      // 1) ask backend for presign
      const presignRes = await fetch(`${apiBase}/v1/media/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant": tenant },
        credentials: "include",
        body: JSON.stringify({
          kind: "listing-image",
          contentType: f.type || "image/jpeg",
          filename: f.name,
        }),
      });
      if (!presignRes.ok) throw new Error("Failed to presign upload");
      const { uploadUrl, fields, publicUrl } = await presignRes.json();

      // 2) upload to storage
      if (fields) {
        // S3 form POST
        const form = new FormData();
        Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
        form.append("file", f);
        const s3 = await fetch(uploadUrl, { method: "POST", body: form });
        if (!s3.ok) throw new Error("Failed to upload image");
      } else {
        // simple PUT
        const put = await fetch(uploadUrl, { method: "PUT", body: f, headers: { "Content-Type": f.type || "application/octet-stream" } });
        if (!put.ok) throw new Error("Failed to upload image");
      }

      // 3) collect public URL
      uploaded.push(publicUrl);
    }
    return uploaded;
  }

  // --- submit ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const tenant = getTenantFromCookie();

      // 1) upload images
      const uploaded = await presignAndUploadImages(formData.images, tenant);

      // 2) create property
      const propertyPayload = {
        type: formData.propertyType,              // "residential" | "commercial" | "land"
        subType: formData.propertySubType,        // keep normalized name
        address: formData.address,
        latitude: Number.isFinite(Number(formData.latitude)) ? Number(formData.latitude) : undefined,
        longitude: Number.isFinite(Number(formData.longitude)) ? Number(formData.longitude) : undefined,
      };

      const propertyRes = await fetch(`${apiBase}/v1/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant": tenant },
        credentials: "include",
        body: JSON.stringify(propertyPayload),
      });
      if (!propertyRes.ok) throw new Error(await propertyRes.text());
      const property = await propertyRes.json();

      // 3) create listing
      const listingPayload = {
        propertyId: property.id,
        priceAmount: Number(formData.priceAmount),
        priceCurrency: formData.priceCurrency,
        status: "PENDING_REVIEW",                 // backend maps to internal lifecycle
        featured: !!formData.featured,
        media: {
          images: uploaded,
          floorPlan: undefined as string | undefined, // (upload floorplan if you add that UI)
          virtualTourUrl: formData.virtualTourUrl || undefined,
        },
        attrs: {
          title: formData.title,
          purpose: formData.purpose,              // "Sale" | "Rent"
          propertyType: formData.propertyType,
          propertySubType: formData.propertySubType,
          bedrooms: formData.propertyType === "land" ? undefined : (Number.isFinite(Number(formData.bedrooms)) ? Number(formData.bedrooms) : undefined),
          bathrooms: formData.propertyType === "land" ? undefined : (Number.isFinite(Number(formData.bathrooms)) ? Number(formData.bathrooms) : undefined),
          area: Number(formData.area),
          areaUnit: formData.areaUnit,
          parking: Number.isFinite(Number(formData.parking)) ? Number(formData.parking) : undefined,
          yearBuilt: Number.isFinite(Number(formData.yearBuilt)) ? Number(formData.yearBuilt) : undefined,
          condition: formData.condition || undefined,
          furnished: !!formData.furnished,
          deposit: formData.deposit ? String(formData.deposit) : undefined,
          monthlyMaintenance: formData.monthlyMaintenance ? String(formData.monthlyMaintenance) : undefined,
          features: formData.features,
          amenities: formData.amenities,
          description: formData.description,
          highlights: formData.highlights,
          contactPhone: formData.contactPhone || undefined,
          contactEmail: formData.contactEmail || undefined,
          availableFrom: formData.availableFrom || undefined,
        },
      };

      const listingRes = await fetch(`${apiBase}/v1/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant": tenant },
        credentials: "include",
        body: JSON.stringify(listingPayload),
      });
      if (!listingRes.ok) throw new Error(await listingRes.text());

      toast("Listing submitted for review.");
      router.push("/broker/listings");
    } catch (err: any) {
      toast(err?.message || "Failed to create listing", "err");
      alert(err?.message || "Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/broker/listings" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Listing</h1>
            <p className="mt-2 text-sm text-slate-600">Add a comprehensive property listing to your portfolio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Basic Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Listing Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                    errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                 : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  }`}
                  placeholder="e.g., Modern 3BR Apartment in Bole"
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property Type <span className="text-red-500">*</span></label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => updateFormData({ propertyType: e.target.value as PropertyType, propertySubType: "" })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Property Sub-Type <span className="text-red-500">*</span></label>
                <select
                  value={formData.propertySubType}
                  onChange={(e) => updateFormData({ propertySubType: e.target.value })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                    errors.propertySubType ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                           : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  }`}
                >
                  <option value="">Select sub-type</option>
                  {propertySubTypes[formData.propertyType].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.propertySubType && <p className="mt-1 text-xs text-red-600">{errors.propertySubType}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose <span className="text-red-500">*</span></label>
                <select
                  value={formData.purpose}
                  onChange={(e) => updateFormData({ purpose: e.target.value as Purpose })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                >
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                </select>
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Address
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Street Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => updateAddress({ street: e.target.value })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                    errors["address.street"] ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                              : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  }`}
                  placeholder="Street name and number"
                />
                {errors["address.street"] && <p className="mt-1 text-xs text-red-600">{errors["address.street"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Subcity <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.address.subcity}
                  onChange={(e) => updateAddress({ subcity: e.target.value })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                    errors["address.subcity"] ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                               : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  }`}
                  placeholder="Bole, Kazanchis, etc."
                />
                {errors["address.subcity"] && <p className="mt-1 text-xs text-red-600">{errors["address.subcity"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => updateAddress({ city: e.target.value })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                    errors["address.city"] ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  }`}
                  placeholder="Addis Ababa"
                />
                {errors["address.city"] && <p className="mt-1 text-xs text-red-600">{errors["address.city"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Region <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.address.region}
                  onChange={(e) => updateAddress({ region: e.target.value })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                    errors["address.region"] ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                              : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  }`}
                  placeholder="Addis Ababa"
                />
                {errors["address.region"] && <p className="mt-1 text-xs text-red-600">{errors["address.region"]}</p>}
              </div>

              {/* Optional geocoding fields */}
              <div>
                <label className="block text-sm font-semibold mb-2">Latitude</label>
                <input
                  type="number"
                  value={formData.latitude ?? ""}
                  onChange={(e) => updateFormData({ latitude: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  placeholder="e.g., 9.0108"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Longitude</label>
                <input
                  type="number"
                  value={formData.longitude ?? ""}
                  onChange={(e) => updateFormData({ longitude: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  placeholder="e.g., 38.7613"
                />
              </div>
            </div>
          </section>

          {/* Property details */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Property Details</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {formData.propertyType !== "land" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Bed className="w-4 h-4" /> Bedrooms *</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.bedrooms ?? ""}
                      onChange={(e) => updateFormData({ bedrooms: e.target.value === "" ? undefined : Number(e.target.value) })}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                        errors.bedrooms ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                        : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                      }`}
                    />
                    {errors.bedrooms && <p className="mt-1 text-xs text-red-600">{errors.bedrooms}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Bath className="w-4 h-4" /> Bathrooms *</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.bathrooms ?? ""}
                      onChange={(e) => updateFormData({ bathrooms: e.target.value === "" ? undefined : Number(e.target.value) })}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                        errors.bathrooms ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                         : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                      }`}
                    />
                    {errors.bathrooms && <p className="mt-1 text-xs text-red-600">{errors.bathrooms}</p>}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Square className="w-4 h-4" /> Area (net) *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={formData.area || ""}
                    onChange={(e) => updateFormData({ area: e.target.value ? Number(e.target.value) : 0 })}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                      errors.area ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                    }`}
                    placeholder="e.g., 120"
                  />
                  <select
                    value={formData.areaUnit}
                    onChange={(e) => updateFormData({ areaUnit: e.target.value as AreaUnit })}
                    className="w-28 rounded-lg border border-slate-300 px-2 py-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                  >
                    <option value="sqm">sqm</option>
                    <option value="sqft">sqft</option>
                  </select>
                </div>
                {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Car className="w-4 h-4" /> Parking</label>
                <input
                  type="number"
                  min={0}
                  value={formData.parking ?? ""}
                  onChange={(e) => updateFormData({ parking: e.target.value === "" ? undefined : Number(e.target.value) })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Year Built</label>
                <input
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={formData.yearBuilt ?? ""}
                  onChange={(e) => updateFormData({ yearBuilt: e.target.value === "" ? undefined : Number(e.target.value) })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => updateFormData({ condition: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                >
                  <option value="">Select</option>
                  {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Furnished</label>
                <select
                  value={formData.furnished ? "yes" : "no"}
                  onChange={(e) => updateFormData({ furnished: e.target.value === "yes" })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Pricing</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Price Amount <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.priceAmount}
                  onChange={(e) => updateFormData({ priceAmount: e.target.value })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                    errors.priceAmount ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                       : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  }`}
                  placeholder="e.g., 12500000"
                />
                {errors.priceAmount && <p className="mt-1 text-xs text-red-600">{errors.priceAmount}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Currency</label>
                <select
                  value={formData.priceCurrency}
                  onChange={(e) => updateFormData({ priceCurrency: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                >
                  <option value="ETB">ETB</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Deposit</label>
                <input
                  type="text"
                  value={formData.deposit ?? ""}
                  onChange={(e) => updateFormData({ deposit: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  placeholder="optional"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Monthly Maintenance</label>
                <input
                  type="text"
                  value={formData.monthlyMaintenance ?? ""}
                  onChange={(e) => updateFormData({ monthlyMaintenance: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  placeholder="optional"
                />
              </div>
            </div>
          </section>

          {/* Features & Amenities */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Features & Amenities</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-semibold">Common Features</div>
                <div className="flex flex-wrap gap-2">
                  {commonFeatures.map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => toggleFeature(f)}
                      className={`px-3 py-1 rounded-full text-xs border ${
                        formData.features.includes(f) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Add custom feature"
                  />
                  <button type="button" onClick={addFeature} className="px-3 py-2 rounded-lg bg-slate-800 text-white text-sm">
                    <Plus className="w-4 h-4 inline-block mr-1" /> Add
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Common Amenities</div>
                <div className="flex flex-wrap gap-2">
                  {commonAmenities.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1 rounded-full text-xs border ${
                        formData.amenities.includes(a) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Add custom amenity"
                  />
                  <button type="button" onClick={addAmenity} className="px-3 py-2 rounded-lg bg-slate-800 text-white text-sm">
                    <Plus className="w-4 h-4 inline-block mr-1" /> Add
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Description</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                    errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                       : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  }`}
                  placeholder="Describe the property, location, finish level, etc."
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Highlights</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) => updateFormData({ highlights: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                  placeholder="Short selling points (comma separated optional)"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 flex items-center gap-2">
              <UploadIcon className="w-5 h-5" /> Images <span className="text-red-500">*</span>
            </h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((f, idx) => {
                  const url = URL.createObjectURL(f);
                  return (
                    <div key={idx} className="relative border rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`image-${idx}`} className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 rounded bg-black/60 text-white p-1"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Contact & Availability */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Contact & Availability</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone ?? ""}
                  onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail ?? ""}
                  onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Available From</label>
                <input
                  type="date"
                  value={formData.availableFrom ?? ""}
                  onChange={(e) => updateFormData({ availableFrom: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm border-slate-300 focus:border-indigo-600 focus:ring-indigo-600"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/broker/listings")}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}