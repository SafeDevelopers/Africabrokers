import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border-2 border-rose-200 bg-white p-8 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🚫</span>
            <div>
              <h2 className="text-xl font-semibold text-rose-900">Access Forbidden</h2>
              <p className="text-sm text-rose-700 mt-1">
                You don&apos;t have permission to access this page. This area requires SUPER_ADMIN or TENANT_ADMIN role.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/login"
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

