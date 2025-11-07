"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/auth-context";
import { LeadsTable } from "../../components/broker/LeadsTable";
import { Loader2, RefreshCw } from "lucide-react";

type LeadStatus = "NEW" | "READ" | "ARCHIVED";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  budget?: string;
  status: LeadStatus;
  source: string;
  notes?: string;
  createdAt: string;
  lastContacted?: string;
}

const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
const TENANT_KEY = process.env.NEXT_PUBLIC_TENANT_KEY;

const mapInquiryStatusToLead = (status: string): LeadStatus => {
  switch (status) {
    case "READ":
      return "READ";
    case "ARCHIVED":
      return "ARCHIVED";
    default:
      return "NEW";
  }
};

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

export default function BrokerInquiriesPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = user?.role === "broker";

  const fetchLeads = useCallback(async () => {
    if (!canManage) {
      setError("Switch to a broker account to manage inquiries.");
      setLeads([]);
      return;
    }

    if (!CORE_API_BASE_URL) {
      setError("Core API base URL is not configured.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${CORE_API_BASE_URL}/v1/broker/inquiries`, {
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
        throw new Error(`Failed to load inquiries: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const mapped: Lead[] = (data.items || []).map((item: any) => {
        const listing = item.listing || {};
        const property = listing.property || {};
        return {
          id: item.id,
          name: item.fullName || "Unknown lead",
          email: item.email || "—",
          phone: item.phone || "—",
          propertyType: property.propertyType || "Listing",
          location: formatAddress(property.address),
          budget: undefined,
          status: mapInquiryStatusToLead(item.status),
          source: item.source || "Unknown",
          notes: item.brokerNotes || undefined,
          createdAt: item.createdAt,
          lastContacted: item.updatedAt,
        };
      });

      setLeads(mapped);
    } catch (err) {
      let errorMessage = "Failed to load inquiries";
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
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    if (!CORE_API_BASE_URL || !canManage) {
      return;
    }

    try {
      const response = await fetch(`${CORE_API_BASE_URL}/v1/broker/inquiries/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(TENANT_KEY ? { "X-Tenant": TENANT_KEY } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to update inquiry: ${response.status} ${errorText}`);
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update inquiry");
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    if (!CORE_API_BASE_URL || !canManage) {
      return;
    }

    try {
      const response = await fetch(`${CORE_API_BASE_URL}/v1/broker/inquiries/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(TENANT_KEY ? { "X-Tenant": TENANT_KEY } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ brokerNotes: note }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to save note: ${response.status} ${errorText}`);
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, notes: note } : lead
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inquiries</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage and track your property inquiries and leads
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            All Inquiries
          </h2>
          <button
            type="button"
            onClick={fetchLeads}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            disabled={loading || !canManage}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchLeads}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              disabled={loading}
            >
              Retry
            </button>
          </div>
        ) : (
          <LeadsTable
            leads={leads}
            onStatusChange={handleStatusChange}
            onAddNote={handleAddNote}
          />
        )}
      </section>
    </div>
  );
}
