import { Metadata } from 'next';
import { apiClient } from '../../../../lib/api-client';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Agent Application Details | Super Admin | AfriBrok Admin',
  description: 'Review agent application details',
};

export default async function AgentApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let application: any = null;
  let error: string | null = null;

  try {
    const data = await apiClient.get(`/superadmin/agents/${params.id}`, {
      includeTenant: false,
    });
    application = data;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load application';
    if (error.includes('404') || error.includes('not found')) {
      notFound();
    }
  }

  if (!application) {
    notFound();
  }

  const payload = application.payload || {};
  const orgType = application.orgType || payload.orgType;
  const orgTypeNotes = application.orgTypeNotes || payload.orgTypeNotes;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agent Application Details</h1>
        <p className="mt-2 text-gray-600">Review application information and make a decision</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applicant Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Applicant Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Organization Name</label>
              <p className="mt-1 text-sm text-gray-900">{payload.organizationName || '-'}</p>
            </div>
            {(orgType || payload.organizationType) && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Organization Type</label>
                <p className="mt-1 text-sm text-gray-900">{orgType || payload.organizationType || '-'}</p>
              </div>
            )}
            {orgTypeNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Organization Type Notes</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{orgTypeNotes}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500">Registration Number</label>
              <p className="mt-1 text-sm text-gray-900">{payload.registrationNumber || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Location</label>
              <p className="mt-1 text-sm text-gray-900">
                {payload.address || '-'}
                {payload.city && `, ${payload.city}`}
                {payload.country && `, ${payload.country}`}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Primary Contact</label>
              <div className="mt-1 space-y-1">
                {payload.primaryContact?.name && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Name:</span> {payload.primaryContact.name}
                  </p>
                )}
                {payload.primaryContact?.email && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Email:</span> {payload.primaryContact.email}
                  </p>
                )}
                {payload.primaryContact?.phone && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Phone:</span> {payload.primaryContact.phone}
                  </p>
                )}
              </div>
            </div>
            {payload.secondaryContact && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Secondary Contact</label>
                <div className="mt-1 space-y-1">
                  {payload.secondaryContact.name && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Name:</span> {payload.secondaryContact.name}
                    </p>
                  )}
                  {payload.secondaryContact.email && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Email:</span> {payload.secondaryContact.email}
                    </p>
                  )}
                  {payload.secondaryContact.phone && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Phone:</span> {payload.secondaryContact.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Operations Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Operations Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Team Size</label>
              <p className="mt-1 text-sm text-gray-900">{payload.teamSize || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Coverage Areas</label>
              <p className="mt-1 text-sm text-gray-900">
                {Array.isArray(payload.coverageAreas) && payload.coverageAreas.length > 0
                  ? payload.coverageAreas.join(', ')
                  : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Previous Experience</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {payload.previousExperience || '-'}
              </p>
            </div>
            {Array.isArray(payload.complianceStandards) && payload.complianceStandards.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Compliance Standards</label>
                <p className="mt-1 text-sm text-gray-900">
                  {payload.complianceStandards.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    application.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : application.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : application.status === 'NEEDS_INFO'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {application.status}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Submitted At</label>
              <p className="mt-1 text-sm text-gray-900">
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleString()
                  : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">User</label>
              <p className="mt-1 text-sm text-gray-900">{application.user?.email || application.userId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Tenant</label>
              <p className="mt-1 text-sm text-gray-900">
                {application.tenant?.name || application.tenantId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex items-center gap-4">
          <form action={`/api/superadmin/agents/${params.id}/approve`} method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve
            </button>
          </form>
          <form action={`/api/superadmin/agents/${params.id}/reject`} method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject
            </button>
          </form>
          <form action={`/api/superadmin/agents/${params.id}/request-info`} method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Request More Info
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

