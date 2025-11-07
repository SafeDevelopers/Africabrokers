import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api-server";
import {
  formatDateTime,
  getBrokerStatusColor,
  getBrokerStatusLabel,
} from "@afribrok/lib";

type BrokerReview = {
  id: string;
  decision: string;
  notes: string | null;
  createdAt: string;
  decidedAt: string | null;
  reviewer?: {
    id: string;
    email?: string;
    role?: string;
  } | null;
};

type BrokerResponse = {
  id: string;
  tenantId: string;
  userId: string;
  licenseNumber: string;
  licenseDocs: Record<string, unknown> | null;
  businessDocs: Record<string, unknown> | null;
  status: string;
  rating: number | null;
  strikeCount: number;
  submittedAt: string | null;
  approvedAt: string | null;
  qrCode?: {
    id: string;
    status: string;
    code: string;
    updatedAt: string;
  } | null;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
  kycReviews: BrokerReview[];
};

const statusStyles: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // ignore
    }
  }
  return {};
};

async function getBroker(id: string): Promise<BrokerResponse> {
  try {
    // Use admin endpoint for tenant admin access
    return await apiRequest<BrokerResponse>(`/v1/admin/brokers/${id}`);
  } catch (error) {
    if (error instanceof Error && (error.message.includes("404") || error.message.includes("not found"))) {
      notFound();
    }
    throw error;
  }
}

const documentLabels: Record<string, string> = {
  businessName: "Business name",
  licenseUrl: "Business license",
  idUrl: "National ID",
  selfieUrl: "Selfie verification",
  tinCertificate: "TIN certificate",
};

function normalizeDocs(docs: Record<string, unknown>): { key: string; label: string; value: string }[] {
  return Object.entries(docs)
    .filter(([, value]) => typeof value === "string" && value.length > 0)
    .map(([key, value]) => ({
      key,
      label: documentLabels[key] ?? key,
      value: value as string,
    }));
}

export default async function BrokerDetailPage({ params }: { params: { id: string } }) {
  let broker: BrokerResponse | null = null;
  let error: Error | null = null;
  
  try {
    broker = await getBroker(params.id);
  } catch (err) {
    // Log error but don't redirect - show error state instead
    console.error("Failed to load broker:", err);
    if (err instanceof Error) {
      error = err;
    } else {
      error = new Error("Failed to load broker details");
    }
  }
  
  // If there's an error, show error state instead of redirecting
  if (error || !broker) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Broker Details</h1>
                <p className="text-sm text-gray-500">Verify credentials, review submissions, and manage status.</p>
              </div>
              <Link href="/brokers" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                ← Back to Brokers
              </Link>
            </div>
          </div>
        </header>
        <main className="px-6 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h2 className="text-xl font-semibold text-red-900">Failed to load broker</h2>
                <p className="text-sm text-red-700 mt-1">
                  {error?.message || "Unable to load broker details. Please try again."}
                </p>
                <Link
                  href="/brokers"
                  className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
                >
                  Back to Brokers
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  const licenseDocs = toRecord(broker.licenseDocs ?? {});
  const businessDocs = toRecord(broker.businessDocs ?? {});
  const docItems = normalizeDocs(licenseDocs);
  const supportingDocs = normalizeDocs(businessDocs);

  const statusLabel = getBrokerStatusLabel(broker.status);
  const statusColor = statusStyles[getBrokerStatusColor(broker.status)] ?? statusStyles.gray;

  const canApprove = broker.status === "submitted";
  const canSuspend = broker.status === "approved";

  const reviewHistory = broker.kycReviews
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Broker Details</h1>
              <p className="text-sm text-gray-500">Verify credentials, review submissions, and manage status.</p>
            </div>
            <Link href="/brokers" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to Brokers
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Broker ID</p>
                <p className="font-semibold text-gray-900">{broker.id}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
                {statusLabel}
              </span>
            </div>

            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {(licenseDocs.businessName as string) || broker.user.email}
                  </h2>
                  <dl className="mt-3 space-y-2 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <dt>License number</dt>
                      <dd className="font-medium">{broker.licenseNumber}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Account email</dt>
                      <dd>{broker.user.email}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Submitted</dt>
                      <dd>{broker.submittedAt ? formatDateTime(broker.submittedAt) : "—"}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Approved</dt>
                      <dd>{broker.approvedAt ? formatDateTime(broker.approvedAt) : "Pending"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Account health</p>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Rating</span>
                      <span>{broker.rating != null ? broker.rating.toFixed(1) : "Not rated"}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Strikes</span>
                      <span>{broker.strikeCount}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>QR code</span>
                      {broker.qrCode ? (
                        <Link
                          href={`/qr-codes/${broker.qrCode.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          View QR →
                        </Link>
                      ) : (
                        <span>Not generated</span>
                      )}
                    </li>
                  </ul>
                </div>
              </div>

              <section>
                <h3 className="text-md font-semibold text-gray-900">Required documents</h3>
                {docItems.length ? (
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {docItems.map((doc) => (
                      <li key={doc.key} className="flex items-center justify-between">
                        <span>{doc.label}</span>
                        {doc.value.startsWith("http") ? (
                          <a
                            href={doc.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            View →
                          </a>
                        ) : (
                          <span className="font-medium text-gray-900">{doc.value}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No documents uploaded yet.</p>
                )}
              </section>

              <section>
                <h3 className="text-md font-semibold text-gray-900">Supporting evidence</h3>
                {supportingDocs.length ? (
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {supportingDocs.map((doc) => (
                      <li key={doc.key} className="flex items-center justify-between">
                        <span>{doc.label}</span>
                        {doc.value.startsWith("http") ? (
                          <a
                            href={doc.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            View →
                          </a>
                        ) : (
                          <span className="font-medium text-gray-900">{doc.value}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No supporting documents provided.</p>
                )}
              </section>

              <section>
                <h3 className="text-md font-semibold text-gray-900">KYC review history</h3>
                {reviewHistory.length ? (
                  <ul className="mt-3 space-y-3">
                    {reviewHistory.map((review) => (
                      <li key={review.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold capitalize">{review.decision.replace(/_/g, " ")}</span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(review.decidedAt ?? review.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-5 text-gray-600">
                          {review.notes || "Reviewer did not include notes."}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Reviewer: {review.reviewer?.email ?? "Unassigned"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No review actions recorded yet.</p>
                )}
              </section>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
              <div className="mt-3 space-y-2">
                <button
                  id="approve-broker-btn"
                  name="approve-broker"
                  type="button"
                  className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={!canApprove}
                >
                  Approve broker
                </button>
                <button
                  id="request-documents-btn"
                  name="request-documents"
                  type="button"
                  className="w-full rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  Request more documents
                </button>
                <button
                  id="suspend-account-btn"
                  name="suspend-account"
                  type="button"
                  className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={!canSuspend}
                >
                  Suspend account
                </button>
              </div>
              {!canApprove ? (
                <p className="mt-3 text-xs text-gray-500">
                  Approvals are available when status is <strong>submitted</strong>. Use documents above to verify details.
                </p>
              ) : null}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">Login context</h3>
              <dl className="mt-3 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <dt>User role</dt>
                  <dd className="capitalize">{broker.user.role.toLowerCase().replace(/_/g, " ")}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Status</dt>
                  <dd>{broker.user.status}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Tenant</dt>
                  <dd>{broker.tenantId}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
