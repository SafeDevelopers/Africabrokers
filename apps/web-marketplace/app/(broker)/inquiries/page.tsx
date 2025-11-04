"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";
import { InquiryRow } from "../../components/broker/InquiryRow";
import { listInquiries, updateInquiry, type Inquiry } from "../../../lib/inquiries";
import { Search, Filter, Mail, ChevronLeft, ChevronRight } from "lucide-react";

export default function BrokerInquiriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!user || user.role !== "broker") {
      router.push("/signin");
      return;
    }
    loadInquiries();
  }, [user, router, statusFilter, searchQuery, currentPage]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listInquiries({
        status: statusFilter || undefined,
        q: searchQuery || undefined,
        page: currentPage,
        limit,
      });
      setInquiries(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error("Failed to load inquiries:", err);
      setError(err instanceof Error ? err.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateInquiry(id, { status: status as "NEW" | "READ" | "ARCHIVED" });
      // Reload inquiries
      await loadInquiries();
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInquiries();
  };

  if (!user || user.role !== "broker") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inquiries</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage leads and inquiries from potential buyers and renters
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or message..."
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">Loading inquiries...</div>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Mail className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No inquiries yet</h3>
          <p className="text-sm text-slate-600">
            {searchQuery || statusFilter
              ? "No inquiries match your filters."
              : "New inquiries from potential buyers will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Received
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inquiries.map((inquiry) => (
                    <InquiryRow
                      key={inquiry.id}
                      inquiry={inquiry}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4">
              <div className="text-sm text-slate-600">
                Showing {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, total)} of {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

