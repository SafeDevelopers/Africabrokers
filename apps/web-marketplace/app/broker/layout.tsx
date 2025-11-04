import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarNav } from '../components/broker/SidebarNav';
import { Topbar } from '../components/broker/Topbar';

export default async function BrokerShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get pathname from header set by middleware
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  
  // Allow /broker/apply and /broker/pending without authentication
  const isPublicRoute = pathname === '/broker/apply' || 
                        pathname.startsWith('/broker/apply/') || 
                        pathname === '/broker/pending' || 
                        pathname.startsWith('/broker/pending/');
  
  // If it's a public route, render without authentication check
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  // For all other broker routes, require authentication
  const cookieStore = await cookies();
  const role = cookieStore.get('afribrok-role')?.value;

  if (!role || !['BROKER', 'broker'].includes(role)) {
    redirect('/signin');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav />
      <div className="flex-1 flex flex-col w-full lg:pl-[260px]">
        <Topbar />
        <main className="flex-1">
          <div className="mx-auto max-w-screen-2xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
