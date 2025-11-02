"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface BrokerVerification {
  id: string;
  user: {
    authProviderId: string;
  };
  licenseNumber: string;
  licenseDocs: {
    businessName: string;
    licenseUrl?: string;
    idUrl?: string;
    selfieUrl?: string;
  };
  businessDocs?: {
    businessLicense?: string;
  };
  status: 'verification_required' | 'under_review' | 'additional_docs_needed';
  submittedAt: string;
  lastContactedAt?: string;
  verificationNotes?: string;
}

const mockVerificationQueue: BrokerVerification[] = [
  {
    id: "broker-v1",
    user: { authProviderId: "pending.broker1@example.com" },
    licenseNumber: "ETH-AA-2024-010",
    licenseDocs: {
      businessName: "New Era Properties",
      licenseUrl: "/uploads/license-v1.pdf",
      idUrl: "/uploads/id-v1.pdf",
      selfieUrl: "/uploads/selfie-v1.jpg"
    },
    status: "verification_required",
    submittedAt: "2024-01-22T08:30:00Z",
    verificationNotes: "Initial verification required for new license submission"
  },
  {
    id: "broker-v2", 
    user: { authProviderId: "verification.needed@realty.et" },
    licenseNumber: "ETH-AA-2024-011",
    licenseDocs: {
      businessName: "Mountain View Realty",
      licenseUrl: "/uploads/license-v2.pdf",
      idUrl: "/uploads/id-v2.pdf"
    },
    status: "additional_docs_needed",
    submittedAt: "2024-01-20T14:15:00Z",
    lastContactedAt: "2024-01-21T10:00:00Z",
    verificationNotes: "Missing business license document and selfie verification"
  },
  {
    id: "broker-v3",
    user: { authProviderId: "under.review@homes.et" },
    licenseNumber: "ETH-AA-2024-012",
    licenseDocs: {
      businessName: "City Center Homes",
      licenseUrl: "/uploads/license-v3.pdf",
      idUrl: "/uploads/id-v3.pdf",
      selfieUrl: "/uploads/selfie-v3.jpg"
    },
    businessDocs: {
      businessLicense: "/uploads/business-v3.pdf"
    },
    status: "under_review",
    submittedAt: "2024-01-19T16:45:00Z",
    lastContactedAt: "2024-01-20T09:30:00Z",
    verificationNotes: "All documents submitted, manual review in progress"
  }
];

export default function BrokerVerificationPage() {
  const [verifications, setVerifications] = useState<BrokerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setVerifications(mockVerificationQueue);
      setLoading(false);
    }, 800);
  }, []);

  const filteredVerifications = verifications.filter(verification => {
    return statusFilter === "all" || verification.status === statusFilter;
  });

  const statusCounts = {
    all: verifications.length,
    verification_required: verifications.filter(v => v.status === 'verification_required').length,
    under_review: verifications.filter(v => v.status === 'under_review').length,
    additional_docs_needed: verifications.filter(v => v.status === 'additional_docs_needed').length,
  };

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
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Broker Verification Queue</h1>
              <p className="text-sm text-gray-500">
                Review and verify broker documentation and credentials
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/brokers"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to All Brokers
              </Link>
              <Link
                href="/brokers/pending"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
              >
                View Pending Apps
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatusCard
              label="Total"
              count={statusCounts.all}
              color="gray"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <StatusCard
              label="Verification Required"
              count={statusCounts.verification_required}
              color="yellow"
              active={statusFilter === "verification_required"}
              onClick={() => setStatusFilter("verification_required")}
            />
            <StatusCard
              label="Under Review"
              count={statusCounts.under_review}
              color="blue"
              active={statusFilter === "under_review"}
              onClick={() => setStatusFilter("under_review")}
            />
            <StatusCard
              label="Additional Docs Needed"
              count={statusCounts.additional_docs_needed}
              color="red"
              active={statusFilter === "additional_docs_needed"}
              onClick={() => setStatusFilter("additional_docs_needed")}
            />
          </div>

          {/* Verification Queue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredVerifications.length} Verification{filteredVerifications.length !== 1 ? 's' : ''} Pending
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredVerifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No verifications found matching your criteria.</p>
                </div>
              ) : (
                filteredVerifications.map((verification) => (
                  <VerificationRow key={verification.id} verification={verification} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({ 
  label, 
  count, 
  color, 
  active, 
  onClick 
}: { 
  label: string; 
  count: number; 
  color: string; 
  active: boolean; 
  onClick: () => void; 
}) {
  const colorClasses = {
    gray: active ? "bg-gray-100 border-gray-300" : "bg-white border-gray-200 hover:bg-gray-50",
    blue: active ? "bg-blue-100 border-blue-300" : "bg-white border-gray-200 hover:bg-blue-50",
    yellow: active ? "bg-yellow-100 border-yellow-300" : "bg-white border-gray-200 hover:bg-yellow-50",
    red: active ? "bg-red-100 border-red-300" : "bg-white border-gray-200 hover:bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border text-center transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </button>
  );
}

function VerificationRow({ verification }: { verification: BrokerVerification }) {
  const statusColors = {
    verification_required: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800", 
    additional_docs_needed: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    verification_required: "VERIFICATION REQUIRED",
    under_review: "UNDER REVIEW",
    additional_docs_needed: "DOCS NEEDED"
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

  const handleVerificationAction = (action: string) => {
    // Mock verification actions
    console.log(`${action} verification for ${verification.id}`);
    alert(`${action} verification for ${verification.licenseDocs.businessName}`);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {verification.licenseDocs.businessName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {verification.licenseDocs.businessName}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[verification.status]}`}>
                  {statusLabels[verification.status]}
                </span>
              </div>
              
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                <span>📄 {verification.licenseNumber}</span>
                <span>📧 {verification.user.authProviderId}</span>
                <span>📅 Submitted {formatDate(verification.submittedAt)}</span>
                {verification.lastContactedAt && (
                  <span>📞 Last Contact {formatDate(verification.lastContactedAt)}</span>
                )}
              </div>
              
              {verification.verificationNotes && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    📝 {verification.verificationNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleVerificationAction("Approve")}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => handleVerificationAction("Request Docs")}
            className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-orange-700"
          >
            📄 Request Docs
          </button>
          <button
            onClick={() => handleVerificationAction("Reject")}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
          >
            ❌ Reject
          </button>
          <Link
            href={`/brokers/${verification.id}`}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}