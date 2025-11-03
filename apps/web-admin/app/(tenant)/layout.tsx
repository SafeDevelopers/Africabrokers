import { redirect } from 'next/navigation';
import { getUserContext } from '../../lib/auth';
import TenantAdminSidebar from '../components/TenantAdminSidebar';

export default async function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userContext = await getUserContext();

  // Redirect if not tenant admin or agent
  if (!userContext.isTenantAdmin && !userContext.isAgent && !userContext.isSuperAdmin) {
    redirect('/login');
  }

  // Super admin should use super layout
  if (userContext.isSuperAdmin) {
    redirect('/super');
  }

  // Ensure tenant context exists
  if (!userContext.tenantId) {
    redirect('/login');
  }

  return (
    <TenantAdminSidebar>
      {children}
    </TenantAdminSidebar>
  );
}

