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

  // Redirect if not super admin
  if (!userContext.isSuperAdmin) {
    if (userContext.tenantId) {
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
