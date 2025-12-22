'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Search, Menu, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationsPopover from '@/components/notifications/NotificationsPopover';
import { useSidebar } from '@/context/SidebarContext';

export default function Header({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { toggleMobileSidebar } = useSidebar();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="flex justify-between items-center px-8 py-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-neutral-400 font-medium hidden sm:inline">Inicio</span>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-neutral-300" />
              <span className={cn(
                "font-medium",
                index === breadcrumbs.length - 1 ? "text-neutral-900" : "text-neutral-400"
              )}>
                {crumb}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none w-64"
            />
          </div>

          <div className="h-6 w-px bg-neutral-200" />

          <div className="flex items-center gap-4">
            <NotificationsPopover />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
