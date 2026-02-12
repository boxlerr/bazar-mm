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
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-30">
      <div className="flex justify-between items-center px-4 md:px-6 lg:px-8 py-3">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-neutral-400 font-medium hidden sm:inline">Inicio</span>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
              <span className={cn(
                "font-medium",
                index === breadcrumbs.length - 1 ? "text-neutral-800" : "text-neutral-400"
              )}>
                {crumb}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 bg-neutral-50/80 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-400/50 transition-all outline-none w-56 placeholder:text-neutral-400"
            />
          </div>

          {/* Separator */}
          <div className="hidden md:block h-6 w-px bg-neutral-200/70 mx-1.5" />

          {/* Actions Group */}
          <div className="flex items-center gap-1">
            <NotificationsPopover />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-400 hover:text-red-500 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium hover:bg-red-50/80 group"
            >
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
