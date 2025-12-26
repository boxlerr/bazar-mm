import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

import { SidebarProvider } from '@/context/SidebarContext';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={session.user} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
