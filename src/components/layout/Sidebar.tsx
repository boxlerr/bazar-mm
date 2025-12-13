'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Package,
  Users,
  Wallet,
  BarChart3,
  UserCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  Receipt,
  Sliders,
  TrendingUp,
  PanelLeftClose,
  Building2,
  Bell,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  submenu?: SubMenuItem[];
}

interface SubMenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { name: 'Ventas', href: '/ventas', icon: TrendingUp },
  { name: 'Compras', href: '/compras', icon: ShoppingCart },
  { name: 'Proveedores', href: '/proveedores', icon: Truck },
  { name: 'Stock', href: '/stock', icon: Package },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Caja', href: '/caja', icon: Wallet },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  { name: 'Usuarios', href: '/usuarios', icon: UserCircle },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    submenu: [
      { name: 'General', href: '/configuracion', icon: Sliders },
      { name: 'Negocio', href: '/configuracion/empresa', icon: Building2 },
      { name: 'Notificaciones', href: '/configuracion/notificaciones', icon: Bell },
      { name: 'Tickets', href: '/configuracion/ticket', icon: Receipt },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Configuración']);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      // Try to get additional user info from usuarios table
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('nombre, email')
        .eq('auth_user_id', authUser.id)
        .single();

      setUser({
        email: authUser.email || 'usuario@bazar-mm.com',
        name: userProfile?.nombre || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
      });
    }
  };

  const toggleSubmenu = (menuName: string) => {
    if (!isCollapsed) {
      setExpandedMenus(prev =>
        prev.includes(menuName)
          ? prev.filter(name => name !== menuName)
          : [...prev, menuName]
      );
    }
  };

  const isSubmenuActive = (submenu?: SubMenuItem[]) => {
    if (!submenu) return false;
    return submenu.some(item => pathname === item.href);
  };

  const getUserInitial = () => {
    if (!user) return 'U';
    return (user.name || user.email || 'U').charAt(0).toUpperCase();
  };

  return (
    <aside
      className={cn(
        "bg-neutral-900 text-white h-screen flex flex-col shadow-2xl border-r border-neutral-800 transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-800 relative">
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex justify-center w-full group cursor-pointer"
            title="Expandir sidebar"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-red-900/30 transition-all">
              <span className="font-bold text-xl text-white">M</span>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/20">
              <span className="font-bold text-xl text-white">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight whitespace-nowrap">
                Bazar M&M
              </h1>
              <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">Sistema de Gestión</p>
            </div>
          </div>
        )}

        {/* Toggle Button - Only visible when expanded */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 bg-neutral-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all hover:scale-105 border border-neutral-700 hover:border-red-500"
            title="Colapsar sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-neutral-300" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus.includes(item.name);
          const hasActiveSubmenu = isSubmenuActive(item.submenu);
          const Icon = item.icon;

          return (
            <div key={item.name} className="space-y-1">
              {/* Main Menu Item */}
              {hasSubmenu ? (
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={cn(
                    "w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isCollapsed ? "justify-center" : "justify-between",
                    isActive || hasActiveSubmenu
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className={cn("flex items-center gap-3 relative z-10", isCollapsed && "justify-center")}>
                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                        isActive || hasActiveSubmenu ? "scale-110" : "group-hover:scale-110"
                      )}
                    />
                    {!isCollapsed && <span className="font-medium truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform duration-200" />
                    )
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isCollapsed && "justify-center",
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )}
                  />
                  {!isCollapsed && <span className="font-medium truncate">{item.name}</span>}
                </Link>
              )}

              {/* Submenu */}
              {!isCollapsed && (
                <AnimatePresence>
                  {hasSubmenu && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 pl-4 border-l border-neutral-800 space-y-1 my-1">
                        {item.submenu!.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          const SubIcon = subItem.icon;

                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                                isSubActive
                                  ? "text-red-500 bg-red-500/10"
                                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                              )}
                            >
                              <SubIcon
                                className={cn(
                                  "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                                  isSubActive ? "scale-110" : "group-hover:scale-110"
                                )}
                              />
                              <span className="text-sm font-medium truncate">{subItem.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer - User Info */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
        <div className={cn(
          "flex items-center rounded-xl bg-neutral-800/50 border border-neutral-800 transition-all",
          isCollapsed ? "justify-center p-2" : "gap-3 px-4 py-3"
        )}>
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-600 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0"
            title={isCollapsed && user ? user.name || user.email : undefined}
          >
            {getUserInitial()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'Cargando...'}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
