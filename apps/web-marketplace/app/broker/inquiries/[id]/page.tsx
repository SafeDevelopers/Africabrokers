"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/auth-context";
import { Mail, Phone, MapPin, Calendar, ArrowLeft, Loader2 } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  budget?: string;
  message: string;
  status: string;
  createdAt: string;
  listing?: {
    id: string;
    title: string;
  };
}

const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
const TENANT_KEY = process.env.NEXT_PUBLIC_TENANT_KEY;

const formatAddress = (address: unknown): string => {
  if (address && typeof address === "object") {
    const addr = address as Record<string, unknown>;
    return [addr.street, addr.district, addr.city].filter(Boolean).join(", ") || "—";
  }
  if (typeof address === "string") {
    return address;
  }
  return "—";
};

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const inquiryId = params?.id as string;

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiry = async () => {
      if (!inquiryId) return;

      if (user?.role !== "broker") {
        setError("Switch to a broker account to view inquiry details.");
        setLoading(false);
        return;
      }

      if (!CORE_API_BASE_URL) {
        setError("Core API base URL is not configured.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${CORE_API_BASE_URL}/v1/broker/inquiries/${inquiryId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(TENANT_KEY ? { "X-Tenant": TENANT_KEY } : {}),
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Broker authentication required. Please sign in again.");
          }
          const errorText = await response.text().catch(() => response.statusText);
          throw new Error(`Failed to load inquiry: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const listing = data.listing || {};
        const property = listing.property || {};

        const mapped: Inquiry = {
          id: data.id,
          name: data.fullName || "Unknown lead",
          email: data.email || "—",
          phone: data.phone || "—",
          propertyType: property.propertyType || "Listing",
          location: formatAddress(property.address),
          budget: undefined,
          message: data.message || "",
          status: data.status,
          createdAt: data.createdAt,
          listing: listing.id
            ? {
                id: listing.id,
                title:
                  (property.address && formatAddress(property.address)) ||
                  `Listing ${listing.id.slice(0, 6)}`,
              }
            : undefined,
        };

        setInquiry(mapped);
      } catch (err) {
        let errorMessage = "Failed to load inquiry";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessage = String(err.message);
        }
        // Handle network errors
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          errorMessage = "Network error: Unable to connect to the API. Please check your connection and try again.";
        }
        setError(errorMessage);
        setInquiry(null);
      } finally {
        setLoading(false);
      }
    };

    if (inquiryId) {
      fetchInquiry();
    }
  }, [inquiryId, user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="space-y-6">
        <Link
          href="/broker/inquiries"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inquiries
        </Link>
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-sm text-red-600">{error || "Inquiry not found"}</p>
          <button
            onClick={() => router.push("/broker/inquiries")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Back to Inquiries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/broker/inquiries"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inquiries
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Inquiry Details</h1>
        <p className="mt-2 text-sm text-slate-600">
          View and manage inquiry information
        </p>
      </div>

      {/* Inquiry Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Contact Information</h2>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{inquiry.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{inquiry.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{inquiry.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {new Date(inquiry.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Property Interest</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Property Type</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{inquiry.propertyType}</p>
          </div>
          
          {inquiry.budget && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{inquiry.budget}</p>
            </div>
          )}

          {inquiry.listing && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Listing</p>
              <Link
                href={`/listings/${inquiry.listing.id}`}
                className="mt-1 text-sm font-medium text-primary hover:underline"
              >
                {inquiry.listing.title}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Message */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Message</h2>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{inquiry.message}</p>
      </section>
    </div>
  );
}
