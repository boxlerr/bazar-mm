'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  Receipt,
  Sliders,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  Bell,
  Truck,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useSidebar } from '@/context/SidebarContext';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  submenu?: SubMenuItem[];
  permission?: string;
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
  { name: 'Presupuestos', href: '/presupuestos', icon: ClipboardList },
  { name: 'Reportes', href: '/reportes', icon: BarChart3, permission: 'reportes' },
  { name: 'Usuarios', href: '/usuarios', icon: UserCircle, permission: 'usuarios' },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    permission: 'configuracion',
    submenu: [
      { name: 'General', href: '/configuracion', icon: Sliders },
      { name: 'Negocio', href: '/configuracion/empresa', icon: Building2 },
      { name: 'Plantillas PDF', href: '/configuracion/pdf-templates', icon: Receipt },
      { name: 'Notificaciones', href: '/configuracion/notificaciones', icon: Bell },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Configuración']);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, permissions, loading } = useRole();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

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
    return (user.nombre || user.email || 'U').charAt(0).toUpperCase();
  };

  const getRolLabel = () => {
    if (!user) return '';
    const rol = (user as any).rol;
    if (rol === 'admin') return 'Admin';
    if (rol === 'vendedor') return 'Vendedor';
    if (rol === 'cajero') return 'Cajero';
    return rol || '';
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    if (item.permission === 'configuracion') return permissions?.configuracion?.acceder;
    if (item.permission === 'usuarios') return permissions?.usuarios?.ver;
    if (item.permission === 'reportes') return permissions?.reportes?.ver;
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 text-white h-screen flex flex-col shadow-2xl transition-all duration-300 ease-out",
          // Mobile styles
          "fixed inset-y-0 left-0 z-50 w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop styles
          "md:translate-x-0 md:static",
          isCollapsed ? "md:w-20" : "md:w-56 lg:w-64 xl:w-72"
        )}
      >
        {/* Header */}
        <div className="relative px-4 py-5 lg:px-5">
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="hidden md:flex justify-center w-full group cursor-pointer"
              title="Expandir sidebar"
            >
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain drop-shadow-lg"
                />
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain drop-shadow-lg"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
                  Bazar M&M
                </h1>
                <p className="text-[11px] text-neutral-500 font-medium whitespace-nowrap tracking-wide uppercase">
                  Sistema de Gestión
                </p>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute top-1/2 -translate-y-1/2 right-3 w-7 h-7 bg-white/5 hover:bg-white/10 rounded-lg hidden md:flex items-center justify-center transition-all duration-200 border border-white/5 hover:border-white/10"
              title="Colapsar sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 lg:mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 lg:px-4 space-y-0.5 sidebar-scrollbar">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus.includes(item.name);
            const hasActiveSubmenu = isSubmenuActive(item.submenu);
            const Icon = item.icon;
            const isItemActive = isActive || hasActiveSubmenu;

            return (
              <div key={item.name}>
                {/* Main Menu Item */}
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={cn(
                      "w-full flex items-center rounded-lg transition-all duration-200 group relative",
                      isCollapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5",
                      isItemActive
                        ? "bg-red-500/15 text-white"
                        : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {/* Active indicator bar */}
                    {isItemActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    <div className={cn("flex items-center gap-3 relative z-10", isCollapsed && "justify-center")}>
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0",
                        isItemActive
                          ? "bg-red-500/20 text-red-400 shadow-sm shadow-red-500/10"
                          : "text-neutral-400 group-hover:text-neutral-200"
                      )}>
                        <Icon className="w-[18px] h-[18px]" />
                      </div>
                      {!isCollapsed && (
                        <span className={cn(
                          "text-sm font-medium truncate",
                          isItemActive ? "text-white" : "text-neutral-300 group-hover:text-white"
                        )}>
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-transform duration-300 text-neutral-500",
                          isExpanded && "rotate-180"
                        )}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => isMobileOpen && closeMobileSidebar()}
                    className={cn(
                      "flex items-center gap-3 rounded-lg transition-all duration-200 group relative",
                      isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                      isActive
                        ? "bg-red-500/15 text-white"
                        : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0",
                      isActive
                        ? "bg-red-500/20 text-red-400 shadow-sm shadow-red-500/10"
                        : "text-neutral-400 group-hover:text-neutral-200"
                    )}>
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    {!isCollapsed && (
                      <span className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-white" : "text-neutral-300 group-hover:text-white"
                      )}>
                        {item.name}
                      </span>
                    )}
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
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="ml-6 pl-3 border-l border-white/5 space-y-0.5 py-1">
                          {item.submenu!.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            const SubIcon = subItem.icon;

                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => isMobileOpen && closeMobileSidebar()}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                  isSubActive
                                    ? "text-red-400 bg-red-500/10"
                                    : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                                )}
                              >
                                {/* Active dot */}
                                {isSubActive && (
                                  <div className="absolute -left-[3px] w-1.5 h-1.5 bg-red-500 rounded-full" />
                                )}
                                <SubIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="text-[13px] font-medium truncate">{subItem.name}</span>
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
        <div className="p-3 lg:p-4">
          <div className={cn(
            "flex items-center rounded-xl transition-all duration-200",
            "bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06]",
            isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"
          )}>
            {/* Avatar with gradient ring */}
            <div
              className={cn(
                "flex-shrink-0 relative",
                isCollapsed && "group cursor-default"
              )}
              title={isCollapsed && user ? user.nombre || user.email : undefined}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitial()}
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {user?.nombre || 'Cargando...'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getRolLabel() && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400/80 bg-red-500/10 px-1.5 py-0.5 rounded">
                      {getRolLabel()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar scrollbar styles moved to globals.css */}
    </>

  );
}
