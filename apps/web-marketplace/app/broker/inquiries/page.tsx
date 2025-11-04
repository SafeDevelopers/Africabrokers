"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth-context";
import { LeadsTable } from "../../components/broker/LeadsTable";
import { Loader2, RefreshCw } from "lucide-react";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "VIEWING" | "CLOSED" | "LOST";

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

export default function BrokerInquiriesPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock data
      const mockLeads: Lead[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+251 911 123 456",
          propertyType: "Apartment",
          location: "Addis Ababa",
          budget: "ETB 2,000,000",
          status: "NEW",
          source: "Website",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+251 911 234 567",
          propertyType: "House",
          location: "Addis Ababa",
          budget: "ETB 5,000,000",
          status: "CONTACTED",
          source: "Referral",
          createdAt: new Date().toISOString(),
        },
      ];
      
      setLeads(mockLeads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
  };

  const handleAddNote = (leadId: string, note: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, notes: note } : lead
      )
    );
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
            disabled={loading}
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
