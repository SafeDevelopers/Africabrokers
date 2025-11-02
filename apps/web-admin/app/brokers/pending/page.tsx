"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface PendingBroker {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  location: string;
  submittedAt: string;
  documentsCount: number;
  status: "pending" | "under_review" | "approved" | "rejected";
}

const mockPendingBrokers: PendingBroker[] = [
  {
    id: "broker-1",
    name: "Alemayehu Tadesse",
    email: "alemayehu@example.com",
    phone: "+251911234567",
    businessName: "Tadesse Real Estate",
    location: "Bole, Addis Ababa",
    submittedAt: "2024-10-20T10:30:00Z",
    documentsCount: 5,
    status: "pending"
  },
  {
    id: "broker-2", 
    name: "Sara Mekonnen",
    email: "sara.m@primeprops.et",
    phone: "+251922345678",
    businessName: "Prime Properties Ltd",
    location: "Kazanchis, Addis Ababa",
    submittedAt: "2024-10-19T14:20:00Z",
    documentsCount: 4,
    status: "under_review"
  },
  {
    id: "broker-3",
    name: "Dawit Kebede",
    email: "dawit@elitehomes.et",
    phone: "+251933456789",
    businessName: "Elite Homes",
    location: "Old Airport, Addis Ababa", 
    submittedAt: "2024-10-18T09:15:00Z",
    documentsCount: 6,
    status: "pending"
  }
];

export default function PendingBrokersPage() {
  const [brokers, setBrokers] = useState<PendingBroker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setBrokers(mockPendingBrokers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusUpdate = async (brokerId: string, newStatus: PendingBroker['status']) => {
    setBrokers(prev => 
      prev.map(broker => 
        broker.id === brokerId 
          ? { ...broker, status: newStatus }
          : broker
      )
    );
    
    // Here you would make an API call to update the status
    console.log(`Updating broker ${brokerId} to status: ${newStatus}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-title">Pending Broker Applications</h1>
            <p className="mt-2 text-lg text-body">
              Review and approve broker KYC submissions for platform access.
            </p>
          </div>
          <Link
            href="/brokers"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-title hover:bg-surface"
          >
            ← Back to All Brokers
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-800">Pending Review</h3>
            <p className="text-2xl font-bold text-orange-900">
              {brokers.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Under Review</h3>
            <p className="text-2xl font-bold text-blue-900">
              {brokers.filter(b => b.status === 'under_review').length}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800">Total Submissions</h3>
            <p className="text-2xl font-bold text-gray-900">{brokers.length}</p>
          </div>
        </div>

        {/* Broker List */}
        <div className="space-y-4">
          {brokers.map((broker) => (
            <BrokerCard
              key={broker.id}
              broker={broker}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>

        {brokers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-body">No pending broker applications at this time.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function BrokerCard({ 
  broker, 
  onStatusUpdate 
}: { 
  broker: PendingBroker;
  onStatusUpdate: (id: string, status: PendingBroker['status']) => void;
}) {
  const statusColors = {
    pending: "bg-orange-100 text-orange-800",
    under_review: "bg-blue-100 text-blue-800", 
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
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

  return (
    <article className="rounded-lg bg-surface p-6 shadow-card border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-title">{broker.name}</h3>
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusColors[broker.status]}`}>
              {broker.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <p className="text-sm text-body">
              <span className="font-medium">Business:</span> {broker.businessName}
            </p>
            <p className="text-sm text-body">
              <span className="font-medium">Location:</span> {broker.location}
            </p>
            <p className="text-sm text-body">
              <span className="font-medium">Email:</span> {broker.email}
            </p>
            <p className="text-sm text-body">
              <span className="font-medium">Phone:</span> {broker.phone}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-body">
            <span>📄 {broker.documentsCount} documents</span>
            <span>📅 Submitted {formatDate(broker.submittedAt)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <Link
            href={`/brokers/${broker.id}`}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90"
          >
            Review Details
          </Link>
          
          {broker.status === 'pending' && (
            <button
              onClick={() => onStatusUpdate(broker.id, 'under_review')}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Start Review
            </button>
          )}
          
          {broker.status === 'under_review' && (
            <div className="flex gap-1">
              <button
                onClick={() => onStatusUpdate(broker.id, 'approved')}
                className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onStatusUpdate(broker.id, 'rejected')}
                className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
              >
                ✗ Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}