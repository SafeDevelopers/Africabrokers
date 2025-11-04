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
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock data
        const mockInquiry: Inquiry = {
          id: inquiryId,
          name: "John Doe",
          email: "john@example.com",
          phone: "+251 911 123 456",
          propertyType: "Apartment",
          location: "Addis Ababa",
          budget: "ETB 2,000,000",
          message: "I'm interested in viewing this property. Please contact me.",
          status: "NEW",
          createdAt: new Date().toISOString(),
          listing: {
            id: "listing-1",
            title: "Modern 2BR Apartment in Bole",
          },
        };
        
        setInquiry(mockInquiry);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inquiry");
      } finally {
        setLoading(false);
      }
    };

    if (inquiryId) {
      fetchInquiry();
    }
  }, [inquiryId]);

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
