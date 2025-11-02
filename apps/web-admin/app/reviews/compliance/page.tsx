"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface ComplianceReport {
  id: string;
  title: string;
  type: 'license_compliance' | 'listing_compliance' | 'financial_compliance' | 'safety_compliance';
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  status: 'generated' | 'under_review' | 'approved' | 'requires_action';
  findings: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  affectedEntities: {
    brokers: number;
    listings: number;
    transactions: number;
  };
  generatedBy: string;
  fileSize: string;
  downloadUrl: string;
  summary: string;
}

const mockComplianceReports: ComplianceReport[] = [
  {
    id: "compliance-r1",
    title: "Q4 2024 License Compliance Review",
    type: "license_compliance",
    generatedAt: "2024-01-20T08:00:00Z",
    period: {
      start: "2024-01-01T00:00:00Z",
      end: "2024-01-20T23:59:59Z"
    },
    status: "requires_action",
    findings: {
      total: 23,
      critical: 3,
      high: 8,
      medium: 9,
      low: 3
    },
    affectedEntities: {
      brokers: 15,
      listings: 0,
      transactions: 0
    },
    generatedBy: "admin@afribrok.et",
    fileSize: "2.3 MB",
    downloadUrl: "/reports/compliance-q4-2024-license.pdf",
    summary: "Review identified 3 brokers with expired licenses, 8 with missing documentation, and 9 with minor compliance issues."
  },
  {
    id: "compliance-r2",
    title: "January 2024 Listing Quality Compliance",
    type: "listing_compliance",
    generatedAt: "2024-01-22T14:30:00Z",
    period: {
      start: "2024-01-01T00:00:00Z",
      end: "2024-01-22T23:59:59Z"
    },
    status: "under_review",
    findings: {
      total: 47,
      critical: 2,
      high: 12,
      medium: 25,
      low: 8
    },
    affectedEntities: {
      brokers: 28,
      listings: 156,
      transactions: 0
    },
    generatedBy: "compliance@afribrok.et",
    fileSize: "4.7 MB",
    downloadUrl: "/reports/compliance-jan-2024-listings.pdf",
    summary: "Analysis of listing quality standards compliance shows 2 fraudulent listings, 12 with misleading information, and 25 with minor quality issues."
  },
  {
    id: "compliance-r3",
    title: "Financial Transaction Compliance - Jan 2024",
    type: "financial_compliance",
    generatedAt: "2024-01-21T16:45:00Z",
    period: {
      start: "2024-01-01T00:00:00Z",
      end: "2024-01-21T23:59:59Z"
    },
    status: "approved",
    findings: {
      total: 12,
      critical: 0,
      high: 2,
      medium: 6,
      low: 4
    },
    affectedEntities: {
      brokers: 8,
      listings: 45,
      transactions: 234
    },
    generatedBy: "finance@afribrok.et",
    fileSize: "1.8 MB",
    downloadUrl: "/reports/compliance-jan-2024-financial.pdf",
    summary: "Financial compliance review shows good overall compliance with 2 commission reporting delays and 6 minor documentation issues."
  },
  {
    id: "compliance-r4",
    title: "Safety & Security Compliance Assessment",
    type: "safety_compliance",
    generatedAt: "2024-01-19T11:20:00Z",
    period: {
      start: "2024-01-15T00:00:00Z",
      end: "2024-01-19T23:59:59Z"
    },
    status: "generated",
    findings: {
      total: 8,
      critical: 1,
      high: 2,
      medium: 3,
      low: 2
    },
    affectedEntities: {
      brokers: 12,
      listings: 67,
      transactions: 89
    },
    generatedBy: "security@afribrok.et",
    fileSize: "950 KB",
    downloadUrl: "/reports/compliance-jan-2024-safety.pdf",
    summary: "Safety compliance check identified 1 critical data security issue, 2 high-risk authentication problems, and 3 moderate policy violations."
  }
];

export default function ComplianceReportsPage() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setReports(mockComplianceReports);
      setLoading(false);
    }, 800);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const statusCounts = {
    all: reports.length,
    generated: reports.filter(r => r.status === 'generated').length,
    under_review: reports.filter(r => r.status === 'under_review').length,
    approved: reports.filter(r => r.status === 'approved').length,
    requires_action: reports.filter(r => r.status === 'requires_action').length,
  };

  const totalFindings = reports.reduce((sum, report) => sum + report.findings.total, 0);
  const criticalFindings = reports.reduce((sum, report) => sum + report.findings.critical, 0);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </header>
        <main className="px-6 py-8">
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compliance Reports</h1>
              <p className="text-sm text-gray-500">
                Monitor platform compliance across licenses, listings, transactions, and security
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/reviews"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to Reviews Overview
              </Link>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                onClick={() => alert("Generate new compliance report dialog (mock)")}
              >
                + Generate Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{totalFindings}</p>
              <p className="text-sm text-gray-600">Total Findings</p>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-900">{criticalFindings}</p>
              <p className="text-sm text-red-700">Critical Issues</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-900">{statusCounts.requires_action}</p>
              <p className="text-sm text-yellow-700">Require Action</p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "all" ? "bg-indigo-100 text-indigo-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter("requires_action")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "requires_action" ? "bg-red-100 text-red-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Requires Action ({statusCounts.requires_action})
            </button>
            <button
              onClick={() => setStatusFilter("under_review")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "under_review" ? "bg-yellow-100 text-yellow-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Under Review ({statusCounts.under_review})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "approved" ? "bg-green-100 text-green-700" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Approved ({statusCounts.approved})
            </button>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="license_compliance">License Compliance</option>
              <option value="listing_compliance">Listing Compliance</option>
              <option value="financial_compliance">Financial Compliance</option>
              <option value="safety_compliance">Safety Compliance</option>
            </select>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredReports.length} Compliance Report{filteredReports.length !== 1 ? 's' : ''}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No compliance reports found.</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <ComplianceReportRow key={report.id} report={report} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ComplianceReportRow({ report }: { report: ComplianceReport }) {
  const statusColors = {
    generated: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    requires_action: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    generated: "GENERATED",
    under_review: "UNDER REVIEW",
    approved: "APPROVED",
    requires_action: "REQUIRES ACTION"
  };

  const typeLabels = {
    license_compliance: "License Compliance",
    listing_compliance: "Listing Compliance",
    financial_compliance: "Financial Compliance",
    safety_compliance: "Safety & Security"
  };

  const typeIcons = {
    license_compliance: "📋",
    listing_compliance: "🏠",
    financial_compliance: "💰",
    safety_compliance: "🔒"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDatePeriod = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  const handleReportAction = (action: string) => {
    console.log(`${action} compliance report ${report.id}`);
    alert(`${action} compliance report: ${report.title}`);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{typeIcons[report.type]}</span>
            <h4 className="text-lg font-semibold text-gray-900 truncate">
              {report.title}
            </h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[report.status]}`}>
              {statusLabels[report.status]}
            </span>
          </div>
          
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <span>{typeLabels[report.type]}</span>
            <span>📅 {formatDatePeriod(report.period.start, report.period.end)}</span>
            <span>👤 {report.generatedBy}</span>
            <span>📄 {report.fileSize}</span>
          </div>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>🔍 {report.findings.total} findings</span>
            <span>🚨 {report.findings.critical} critical</span>
            <span>⚠️ {report.findings.high} high</span>
            <span>👥 {report.affectedEntities.brokers} brokers affected</span>
            {report.affectedEntities.listings > 0 && <span>🏠 {report.affectedEntities.listings} listings</span>}
            {report.affectedEntities.transactions > 0 && <span>💰 {report.affectedEntities.transactions} transactions</span>}
          </div>

          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
            <p className="text-sm text-gray-800">
              {report.summary}
            </p>
          </div>

          {report.findings.critical > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800 font-medium">
                🚨 Critical Issues Detected: {report.findings.critical} critical compliance violations require immediate attention.
              </p>
            </div>
          )}

          <div className="mt-2 text-sm text-gray-500">
            Generated: {formatDate(report.generatedAt)}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => window.open(report.downloadUrl, '_blank')}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
          >
            📥 Download
          </button>
          {report.status === 'requires_action' && (
            <button
              onClick={() => handleReportAction("Take Action")}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
            >
              🚨 Take Action
            </button>
          )}
          {report.status === 'under_review' && (
            <button
              onClick={() => handleReportAction("Approve")}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
            >
              ✅ Approve
            </button>
          )}
          <Link
            href={`/reviews/compliance/${report.id}`}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}