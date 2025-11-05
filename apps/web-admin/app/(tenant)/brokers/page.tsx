"use client";

import Link from "next/link";
import { Badge } from "../../components/ui/Badge";
import { useState, useEffect } from "react";

interface Broker {
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
  status: 'draft' | 'submitted' | 'approved' | 'denied' | 'suspended';
  rating: number | null;
  submittedAt: string | null;
  approvedAt: string | null;
  qrCode?: {
    id: string;
    status: string;
  };
}

const mockBrokers: Broker[] = [
  {
    id: "broker-1",
    user: { authProviderId: "alemayehu@example.com" },
    licenseNumber: "ETH-AA-2024-001",
    licenseDocs: {
      businessName: "Tadesse Real Estate",
      licenseUrl: "/uploads/license-1.pdf",
      idUrl: "/uploads/id-1.pdf",
      selfieUrl: "/uploads/selfie-1.jpg"
    },
    businessDocs: {
      businessLicense: "/uploads/business-1.pdf"
    },
    status: "approved",
    rating: 4.8,
    submittedAt: "2024-01-15T10:30:00Z",
    approvedAt: "2024-01-20T14:20:00Z",
    qrCode: { id: "qr-1", status: "active" }
  },
  {
    id: "broker-2",
    user: { authProviderId: "sara.m@primeprops.et" },
    licenseNumber: "ETH-AA-2024-002",
    licenseDocs: {
      businessName: "Prime Properties Ltd",
      licenseUrl: "/uploads/license-2.pdf",
      idUrl: "/uploads/id-2.pdf"
    },
    status: "submitted",
    rating: null,
    submittedAt: "2024-01-19T14:20:00Z",
    approvedAt: null
  },
  {
    id: "broker-3",
    user: { authProviderId: "dawit@elitehomes.et" },
    licenseNumber: "ETH-AA-2024-003",
    licenseDocs: {
      businessName: "Elite Homes",
      licenseUrl: "/uploads/license-3.pdf",
      idUrl: "/uploads/id-3.pdf",
      selfieUrl: "/uploads/selfie-3.jpg"
    },
    status: "approved",
    rating: 4.6,
    submittedAt: "2024-01-10T09:15:00Z",
    approvedAt: "2024-01-15T11:30:00Z",
    qrCode: { id: "qr-3", status: "active" }
  },
  {
    id: "broker-4",
    user: { authProviderId: "kelebework@example.com" },
    licenseNumber: "ETH-AA-2024-004",
    licenseDocs: {
      businessName: "Kelebework Consulting"
    },
    status: "denied",
    rating: null,
    submittedAt: "2024-01-08T16:45:00Z",
    approvedAt: null
  },
  {
    id: "broker-5",
    user: { authProviderId: "hanna@goldproperties.et" },
    licenseNumber: "ETH-AA-2024-005",
    licenseDocs: {
      businessName: "Gold Properties",
      licenseUrl: "/uploads/license-5.pdf",
      idUrl: "/uploads/id-5.pdf",
      selfieUrl: "/uploads/selfie-5.jpg"
    },
    status: "suspended",
    rating: 3.2,
    submittedAt: "2023-12-20T10:00:00Z",
    approvedAt: "2023-12-25T15:30:00Z",
    qrCode: { id: "qr-5", status: "suspended" }
  }
];

export default function AllBrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("submittedAt");

  useEffect(() => {
    // Mock API call - replace with actual API
    setTimeout(() => {
      setBrokers(mockBrokers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = !searchQuery || 
      broker.licenseDocs.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broker.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broker.user.authProviderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || broker.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedBrokers = [...filteredBrokers].sort((a, b) => {
    switch (sortBy) {
      case "submittedAt":
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      case "businessName":
        return a.licenseDocs.businessName.localeCompare(b.licenseDocs.businessName);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const statusCounts = {
    all: brokers.length,
    draft: brokers.filter(b => b.status === 'draft').length,
    submitted: brokers.filter(b => b.status === 'submitted').length,
    approved: brokers.filter(b => b.status === 'approved').length,
    denied: brokers.filter(b => b.status === 'denied').length,
    suspended: brokers.filter(b => b.status === 'suspended').length,
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
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            {[1, 2, 3, 4].map(i => (
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
              <h1 className="text-2xl font-bold text-gray-900">All Brokers</h1>
              <p className="text-sm text-gray-500">
                Manage all broker accounts and their verification status
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/brokers/pending"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
              >
                Review Pending ({statusCounts.submitted})
              </Link>
              <Link
                href="/qr-codes"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Generate QR Codes
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid gap-4 md:grid-cols-6">
            <StatusCard
              label="Total"
              count={statusCounts.all}
              color="gray"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <StatusCard
              label="Draft"
              count={statusCounts.draft}
              color="gray"
              active={statusFilter === "draft"}
              onClick={() => setStatusFilter("draft")}
            />
            <StatusCard
              label="Submitted"
              count={statusCounts.submitted}
              color="blue"
              active={statusFilter === "submitted"}
              onClick={() => setStatusFilter("submitted")}
            />
            <StatusCard
              label="Approved"
              count={statusCounts.approved}
              color="green"
              active={statusFilter === "approved"}
              onClick={() => setStatusFilter("approved")}
            />
            <StatusCard
              label="Denied"
              count={statusCounts.denied}
              color="red"
              active={statusFilter === "denied"}
              onClick={() => setStatusFilter("denied")}
            />
            <StatusCard
              label="Suspended"
              count={statusCounts.suspended}
              color="yellow"
              active={statusFilter === "suspended"}
              onClick={() => setStatusFilter("suspended")}
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by business name, license number, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="submittedAt">Sort by Date</option>
                  <option value="businessName">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                </select>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSortBy("submittedAt");
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Brokers List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredBrokers.length} Broker{filteredBrokers.length !== 1 ? 's' : ''} Found
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {sortedBrokers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No brokers found matching your criteria.</p>
                </div>
              ) : (
                sortedBrokers.map((broker) => (
                  <BrokerRow key={broker.id} broker={broker} />
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
    green: active ? "bg-green-100 border-green-300" : "bg-white border-gray-200 hover:bg-green-50",
    red: active ? "bg-red-100 border-red-300" : "bg-white border-gray-200 hover:bg-red-50",
    yellow: active ? "bg-yellow-100 border-yellow-300" : "bg-white border-gray-200 hover:bg-yellow-50",
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

function BrokerRow({ broker }: { broker: Broker }) {
  const statusVariant = {
    draft: "gray",
    submitted: "blue",
    approved: "green",
    denied: "red",
    suspended: "yellow",
  } as const;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {broker.licenseDocs.businessName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {broker.licenseDocs.businessName}
                </h4>
                <Badge variant={statusVariant[broker.status]}>{broker.status.toUpperCase()}</Badge>
              </div>
              
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                <span>📄 {broker.licenseNumber}</span>
                <span>📧 {broker.user.authProviderId}</span>
                {broker.rating && (
                  <span>⭐ {broker.rating.toFixed(1)}</span>
                )}
                <span>📅 Submitted {formatDate(broker.submittedAt)}</span>
                {broker.approvedAt && (
                  <span>✅ Approved {formatDate(broker.approvedAt)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {broker.qrCode && (
            <Link
              href={`/qr-codes/${broker.qrCode.id}`}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View QR
            </Link>
          )}
          <Link
            href={`/brokers/${broker.id}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}