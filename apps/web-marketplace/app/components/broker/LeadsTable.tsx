"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onAddNote?: (leadId: string, note: string) => void;
}

const statusOptions: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "VIEWING", "CLOSED", "LOST"];

const statusConfig = {
  NEW: { color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  CONTACTED: { color: "bg-purple-100 text-purple-700", icon: Clock },
  QUALIFIED: { color: "bg-indigo-100 text-indigo-700", icon: CheckCircle2 },
  VIEWING: { color: "bg-amber-100 text-amber-700", icon: Clock },
  CLOSED: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  LOST: { color: "bg-red-100 text-red-700", icon: XCircle },
};

export function LeadsTable({ leads, onStatusChange, onAddNote }: LeadsTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "ALL">("ALL");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  const filteredLeads =
    selectedStatus === "ALL"
      ? leads
      : leads.filter((lead) => lead.status === selectedStatus);

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    if (onStatusChange) {
      onStatusChange(leadId, newStatus);
    }
  };

  const handleAddNote = (leadId: string) => {
    if (onAddNote && noteInput[leadId]) {
      onAddNote(leadId, noteInput[leadId]);
      setNoteInput({ ...noteInput, [leadId]: "" });
      setExpandedLead(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setSelectedStatus("ALL")}
          className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold transition ${
            selectedStatus === "ALL"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All ({leads.length})
        </button>
        {statusOptions.map((status) => {
          const count = leads.filter((l) => l.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                selectedStatus === status
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="hidden sm:inline">{status}</span>
              <span className="sm:hidden">{status.slice(0, 3)}</span> ({count})
            </button>
          );
        })}
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white -mx-4 sm:mx-0">
        <div className="min-w-[640px]">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 sm:px-6">
                  Lead
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 sm:px-6">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 sm:px-6 hidden md:table-cell">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 sm:px-6">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500 sm:px-6">
                  No leads found
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const config = statusConfig[lead.status];
                const Icon = config.icon;
                const isExpanded = expandedLead === lead.id;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 sm:px-6">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{lead.name}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span className="hidden sm:inline">{lead.email}</span>
                            <span className="sm:hidden">{lead.email.split('@')[0]}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        </div>
                        {lead.budget && (
                          <p className="mt-1 text-xs font-medium text-slate-700">
                            Budget: {lead.budget}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <div className="text-sm text-slate-900">
                        <p className="font-medium">{lead.propertyType}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {lead.location}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6 hidden md:table-cell">
                      <span className="text-xs text-slate-600">{lead.source}</span>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className={`min-h-[36px] rounded-full px-3 py-1.5 text-xs font-semibold ${config.color} border-0 cursor-pointer`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <button
                        onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                        className="min-h-[36px] min-w-[60px] text-xs font-semibold text-primary hover:underline"
                      >
                        {isExpanded ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Expanded Lead Details */}
      {expandedLead && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">Notes</h3>
              <p className="mt-1 text-sm text-slate-600">{leads.find((l) => l.id === expandedLead)?.notes || "No notes yet"}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Add Note</label>
              <textarea
                value={noteInput[expandedLead] || ""}
                onChange={(e) => setNoteInput({ ...noteInput, [expandedLead]: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                placeholder="Add a note about this lead..."
              />
              <button
                onClick={() => handleAddNote(expandedLead)}
                className="mt-2 min-h-[44px] rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

