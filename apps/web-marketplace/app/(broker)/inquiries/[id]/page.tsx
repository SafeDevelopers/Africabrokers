"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/auth-context";
import { getInquiry, updateInquiry, type Inquiry } from "../../../../lib/inquiries";
import { ArrowLeft, Mail, Phone, Calendar, FileText, Save, CheckCircle, Archive } from "lucide-react";
import Link from "next/link";

export default function InquiryDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const inquiryId = params?.id as string;

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokerNotes, setBrokerNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (!user || user.role !== "broker") {
      router.push("/signin");
      return;
    }
    loadInquiry();
  }, [user, router, inquiryId]);

  const loadInquiry = async () => {
    if (!inquiryId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getInquiry(inquiryId);
      setInquiry(data);
      setBrokerNotes(data.brokerNotes || "");
      setStatus(data.status);
    } catch (err) {
      console.error("Failed to load inquiry:", err);
      setError(err instanceof Error ? err.message : "Failed to load inquiry");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!inquiry) return;

    try {
      setSaving(true);
      await updateInquiry(inquiry.id, { brokerNotes });
      setInquiry((prev) => prev ? { ...prev, brokerNotes } : null);
      alert("Notes saved successfully!");
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Failed to save notes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!inquiry) return;

    try {
      await updateInquiry(inquiry.id, { status: newStatus as "NEW" | "READ" | "ARCHIVED" });
      setStatus(newStatus);
      setInquiry((prev) => prev ? { ...prev, status: newStatus as any } : null);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  if (!user || user.role !== "broker") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading inquiry...</div>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">{error || "Inquiry not found"}</p>
        <Link
          href="/inquiries"
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          ← Back to inquiries
        </Link>
      </div>
    );
  }

  const listingTitle =
    inquiry.listing?.property?.address?.title ||
    inquiry.listing?.property?.propertyType ||
    "Listing";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/inquiries"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Inquiry Details</h1>
          <p className="mt-2 text-sm text-slate-600">From {inquiry.fullName}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Lead Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Full Name
                </label>
                <p className="mt-1 text-sm font-semibold text-slate-900">{inquiry.fullName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-slate-900">
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-primary hover:underline"
                    >
                      {inquiry.email}
                    </a>
                  </p>
                </div>
              </div>
              {inquiry.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone
                    </label>
                    <p className="mt-1 text-sm text-slate-900">
                      <a
                        href={`tel:${inquiry.phone}`}
                        className="text-primary hover:underline"
                      >
                        {inquiry.phone}
                      </a>
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Received
                  </label>
                  <p className="mt-1 text-sm text-slate-900">{formatDate(inquiry.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Listing Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Listing</h2>
            <p className="text-sm text-slate-900">{listingTitle}</p>
            <Link
              href={`/listings/${inquiry.listingId}`}
              className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
            >
              View listing →
            </Link>
          </div>

          {/* Message */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Message</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {inquiry.message}
            </p>
          </div>

          {/* Broker Notes */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Notes</h2>
            <textarea
              value={brokerNotes}
              onChange={(e) => setBrokerNotes(e.target.value)}
              rows={6}
              placeholder="Add private notes about this lead..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Notes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
              Status
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange("NEW")}
                disabled={status === "NEW"}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  status === "NEW"
                    ? "bg-blue-100 text-blue-800"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                New
              </button>
              <button
                onClick={() => handleStatusChange("READ")}
                disabled={status === "READ"}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  status === "READ"
                    ? "bg-green-100 text-green-800"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Mark as Read
              </button>
              <button
                onClick={() => handleStatusChange("ARCHIVED")}
                disabled={status === "ARCHIVED"}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  status === "ARCHIVED"
                    ? "bg-slate-100 text-slate-800"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Archive className="w-4 h-4 inline mr-2" />
                Archive
              </button>
            </div>
          </div>

          {inquiry.lastBrokerView && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                First Viewed
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {formatDate(inquiry.lastBrokerView)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

