"use client";

import { useState } from "react";
import { LeadsTable } from "../../components/broker/LeadsTable";
import type { LeadStatus } from "../../components/broker/LeadsTable";

// Mock leads data - replace with API call
const mockLeads = [
  {
    id: "lead-1",
    name: "Sara Mekonnen",
    email: "sara.m@email.com",
    phone: "+251 911 234 567",
    propertyType: "Apartment",
    location: "Bole, Addis Ababa",
    budget: "ETB 30,000/month",
    status: "NEW" as LeadStatus,
    source: "Referral Link",
    notes: "Looking for 2BR apartment near Bole airport",
    createdAt: "2024-02-10",
  },
  {
    id: "lead-2",
    name: "Alemayehu Tadesse",
    email: "alemayehu.t@email.com",
    phone: "+251 912 345 678",
    propertyType: "Villa",
    location: "Cazanchise, Addis Ababa",
    budget: "ETB 5,000,000",
    status: "CONTACTED" as LeadStatus,
    source: "Marketplace",
    notes: "Interested in viewing next week",
    createdAt: "2024-02-09",
    lastContacted: "2024-02-09",
  },
  {
    id: "lead-3",
    name: "Dawit Kebede",
    email: "dawit.k@email.com",
    phone: "+251 913 456 789",
    propertyType: "Office Space",
    location: "Kirkos, Addis Ababa",
    status: "QUALIFIED" as LeadStatus,
    source: "Referral Link",
    createdAt: "2024-02-08",
  },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState(mockLeads);

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );
    // Show toast notification (you can add a toast library)
    console.log(`Lead ${leadId} status changed to ${newStatus}`);
  };

  const handleAddNote = (leadId: string, note: string) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, notes: note } : lead))
    );
    console.log(`Note added to lead ${leadId}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Leads Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track and manage all leads assigned to you
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-8">
        <LeadsTable
          leads={leads}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      </main>
    </div>
  );
}

