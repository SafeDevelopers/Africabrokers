import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api-server";
import {
  formatDateTime,
  getBrokerStatusColor,
  getBrokerStatusLabel,
} from "@afribrok/lib";

type ReviewResponse = {
  id: string;
  decision: string;
  notes: string | null;
  createdAt: string;
  decidedAt: string | null;
  broker: {
    id: string;
    licenseNumber: string;
    status: string;
    licenseDocs: Record<string, unknown> | null;
    user: {
      id: string;
      email: string;
      role: string;
    };
  } | null;
  reviewer: {
    id: string;
    email: string;
    role: string;
  } | null;
};

const decisionLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending review", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", color: "bg-green-100 text-green-800" },
  denied: { label: "Denied", color: "bg-red-100 text-red-800" },
  needs_more_info: { label: "Needs more info", color: "bg-blue-100 text-blue-800" },
};

const brokerStatusStyles: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
};

async function getReview(id: string): Promise<ReviewResponse> {
  try {
    return await apiRequest<ReviewResponse>(`/v1/reviews/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    throw error;
  }
}

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const review = await getReview(params.id);
  const decisionMeta = decisionLabels[review.decision] ?? decisionLabels.pending;
  const isPending = review.decision === "pending";

  const broker = review.broker;
  const brokerStatus = brokerStatusStyles[getBrokerStatusColor(broker?.status ?? "draft")] ?? brokerStatusStyles.gray;
  const businessName = (broker?.licenseDocs?.["businessName"] as string | undefined) || broker?.user.email || "Broker";

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Details</h1>
              <p className="text-sm text-gray-500">Evaluate supporting material and make a moderation decision.</p>
            </div>
            <Link href="/reviews/pending" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              ← Back to Pending Reviews
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Review ID</p>
                <p className="font-semibold text-gray-900">{review.id}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${decisionMeta.color}`}>
                {decisionMeta.label}
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {broker ? (
                <section className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Broker</p>
                      <p className="text-lg font-semibold text-gray-900">{businessName}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${brokerStatus}`}>
                      {getBrokerStatusLabel(broker.status)}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <dt>License</dt>
                      <dd>{broker.licenseNumber}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Email</dt>
                      <dd>{broker.user.email}</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/brokers/${broker.id}`}
                    className="mt-3 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View broker profile →
                  </Link>
                </section>
              ) : (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  Broker record not attached. Confirm the review payload.
                </p>
              )}

              <section>
                <h2 className="text-md font-semibold text-gray-900">Review notes</h2>
                <div className="mt-3 space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Submitted {formatDateTime(review.createdAt)}</span>
                    <span>
                      Reviewer: {review.reviewer?.email ?? "Unassigned"}{" "}
                      {review.decidedAt ? `· Decided ${formatDateTime(review.decidedAt)}` : ""}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-gray-700">
                    {review.notes || "No reviewer notes yet. Capture findings when making a decision."}
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-gray-900">Audit guidance</h2>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>• Cross-check license number formatting against tenant policy.</li>
                  <li>• Confirm all mandatory documents have been uploaded in the broker record.</li>
                  <li>• If authenticity is uncertain, request additional materials instead of immediate denial.</li>
                </ul>
              </section>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">Moderation</h3>
              <div className="mt-3 space-y-2">
                <button
                  className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={!isPending}
                >
                  Approve
                </button>
                <button
                  className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={!isPending}
                >
                  Reject
                </button>
                <button
                  className="w-full rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={!isPending}
                >
                  Request more info
                </button>
              </div>
              {!isPending ? (
                <p className="mt-3 text-xs text-gray-500">
                  Decision already recorded. To change it, reopen the case from the audit logs.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
