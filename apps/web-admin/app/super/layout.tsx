import { redirect } from 'next/navigation';
import { getUserContext } from '../../lib/auth';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userContext = await getUserContext();

  // Block TENANT_ADMIN from SUPER_ADMIN routes (per RBAC-MATRIX.md)
  // Redirect if not super admin
  if (!userContext.isSuperAdmin) {
    // TENANT_ADMIN should be redirected to tenant routes, not super admin routes
    if (userContext.isTenantAdmin || userContext.isAgent) {
      redirect('/');
    }
    redirect('/login');
  }

  return (
    <SuperAdminSidebar>
      {children}
    </SuperAdminSidebar>
  );
}
