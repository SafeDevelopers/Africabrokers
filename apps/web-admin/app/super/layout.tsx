import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get NextAuth token instead of cookies
  const headersList = await headers();
  let token;
  try {
    token = await getToken({ 
      req: {
        headers: Object.fromEntries(headersList.entries()),
      } as any,
      secret: process.env.NEXTAUTH_SECRET 
    });
  } catch (error) {
    console.error('[SuperAdminLayout] Error getting token:', error);
    redirect('/auth/signin');
  }

  if (!token) {
    redirect('/auth/signin');
  }

  // Get roles from token
  const roles = (token.roles as string[]) || [];
  const isSuperAdmin = roles.includes('SUPER_ADMIN');
  const isTenantAdmin = roles.includes('TENANT_ADMIN');
  const isAgent = roles.includes('AGENT');

  // Block TENANT_ADMIN from SUPER_ADMIN routes (per RBAC-MATRIX.md)
  // Redirect if not super admin
  if (!isSuperAdmin) {
    // TENANT_ADMIN should be redirected to tenant routes, not super admin routes
    if (isTenantAdmin || isAgent) {
      redirect('/');
    }
    redirect('/auth/signin');
  }

  return (
    <SuperAdminSidebar>
      {children}
    </SuperAdminSidebar>
  );
}
