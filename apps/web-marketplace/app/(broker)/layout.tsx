import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarNav } from '../components/broker/SidebarNav';
import { Topbar } from '../components/broker/Topbar';

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role guard
  const cookieStore = await cookies();
  const role = cookieStore.get('afribrok-role')?.value;

  // Check if role is BROKER (case-insensitive)
  if (!role || !['BROKER', 'broker'].includes(role)) {
    redirect('/signin');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav />
      <div className="flex-1 flex flex-col w-full lg:pl-[260px]">
        <Topbar />
        <main className="flex-1">
          <div className="mx-auto max-w-screen-2xl px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

