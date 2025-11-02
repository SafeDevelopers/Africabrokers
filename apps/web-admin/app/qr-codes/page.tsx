"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface QRCode {
  id: string;
  broker: {
    id: string;
    licenseNumber: string;
    licenseDocs: {
      businessName: string;
    };
    rating: number | null;
    status: string;
  };
  qrSvgUrl: string;
  status: 'active' | 'suspended' | 'expired';
  createdAt: string;
  lastScanned?: string;
  scanCount: number;
}

const mockQRCodes: QRCode[] = [
  {
    id: "qr-1",
    broker: {
      id: "broker-1",
      licenseNumber: "ETH-AA-2024-001",
      licenseDocs: { businessName: "Tadesse Real Estate" },
      rating: 4.8,
      status: "approved"
    },
    qrSvgUrl: "/qr-codes/qr-1.svg",
    status: "active",
    createdAt: "2024-01-20T14:20:00Z",
    lastScanned: "2024-10-20T08:30:00Z",
    scanCount: 42
  },
  {
    id: "qr-2",
    broker: {
      id: "broker-3",
      licenseNumber: "ETH-AA-2024-003",
      licenseDocs: { businessName: "Elite Homes" },
      rating: 4.6,
      status: "approved"
    },
    qrSvgUrl: "/qr-codes/qr-3.svg",
    status: "active",
    createdAt: "2024-01-15T11:30:00Z",
    lastScanned: "2024-10-19T16:45:00Z",
    scanCount: 28
  },
  {
    id: "qr-3",
    broker: {
      id: "broker-5",
      licenseNumber: "ETH-AA-2024-005",
      licenseDocs: { businessName: "Gold Properties" },
      rating: 3.2,
      status: "suspended"
    },
    qrSvgUrl: "/qr-codes/qr-5.svg",
    status: "suspended",
    createdAt: "2023-12-25T15:30:00Z",
    lastScanned: "2024-09-15T12:00:00Z",
    scanCount: 15
  }
];

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setQRCodes(mockQRCodes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesSearch = !searchQuery || 
      qr.broker.licenseDocs.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.broker.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || qr.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: qrCodes.length,
    active: qrCodes.filter(qr => qr.status === 'active').length,
    suspended: qrCodes.filter(qr => qr.status === 'suspended').length,
    expired: qrCodes.filter(qr => qr.status === 'expired').length,
  };

  const handleBulkGenerate = () => {
    // TODO: Implement bulk QR generation for all approved brokers without QR codes
    alert("Bulk QR generation functionality will be implemented here");
  };

  const handlePrintPack = () => {
    // TODO: Generate printable PDF with all active QR codes
    alert("Print pack generation functionality will be implemented here");
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
              <p className="text-sm text-gray-500">
                Manage broker verification QR codes and print packs
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkGenerate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Generate Missing QRs
              </button>
              <button
                onClick={handlePrintPack}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                📄 Generate Print Pack
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{statusCounts.all}</p>
                <p className="text-sm text-gray-600 mt-1">Total QR Codes</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{statusCounts.active}</p>
                <p className="text-sm text-gray-600 mt-1">Active Codes</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Scans</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{statusCounts.suspended}</p>
                <p className="text-sm text-gray-600 mt-1">Suspended</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by business name or license number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* QR Codes Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQRCodes.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No QR codes found matching your criteria.</p>
              </div>
            ) : (
              filteredQRCodes.map((qrCode) => (
                <QRCodeCard key={qrCode.id} qrCode={qrCode} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function QRCodeCard({ qrCode }: { qrCode: QRCode }) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    // TODO: Generate and download QR code
    alert(`Downloading QR code for ${qrCode.broker.licenseDocs.businessName}`);
  };

  const handleToggleStatus = () => {
    // TODO: Toggle QR code status
    const newStatus = qrCode.status === 'active' ? 'suspended' : 'active';
    alert(`QR code status will be changed to: ${newStatus}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {qrCode.broker.licenseDocs.businessName}
          </h3>
          <p className="text-sm text-gray-600">{qrCode.broker.licenseNumber}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[qrCode.status]}`}>
          {qrCode.status.toUpperCase()}
        </span>
      </div>

      {/* QR Code Preview */}
      <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
        <div className="w-24 h-24 bg-gray-300 rounded mx-auto mb-2 flex items-center justify-center">
          <span className="text-4xl">📱</span>
        </div>
        <p className="text-xs text-gray-500">QR Code Preview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Scans</p>
          <p className="font-semibold">{qrCode.scanCount}</p>
        </div>
        <div>
          <p className="text-gray-500">Rating</p>
          <p className="font-semibold">
            {qrCode.broker.rating ? `⭐ ${qrCode.broker.rating.toFixed(1)}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Created</p>
          <p className="font-semibold">{formatDate(qrCode.createdAt)}</p>
        </div>
        <div>
          <p className="text-gray-500">Last Scan</p>
          <p className="font-semibold">
            {qrCode.lastScanned ? formatDate(qrCode.lastScanned) : 'Never'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Download
        </button>
        <button
          onClick={handleToggleStatus}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
            qrCode.status === 'active'
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {qrCode.status === 'active' ? 'Suspend' : 'Activate'}
        </button>
      </div>

      <div className="mt-3">
        <Link
          href={`/brokers/${qrCode.broker.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          View Broker Details →
        </Link>
      </div>
    </div>
  );
}