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
  ChevronRight,
  Receipt,
  Sliders,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      { name: 'Tickets', href: '/configuracion/ticket', icon: Receipt },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Configuración']);

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isSubmenuActive = (submenu?: SubMenuItem[]) => {
    if (!submenu) return false;
    return submenu.some(item => pathname === item.href);
  };

  return (
    <aside className="w-72 bg-neutral-900 text-white h-screen flex flex-col shadow-2xl border-r border-neutral-800">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/20">
            <span className="font-bold text-xl text-white">M</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Bazar M&M
            </h1>
            <p className="text-xs text-neutral-400 font-medium">Sistema de Gestión</p>
          </div>
        </div>
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
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive || hasActiveSubmenu
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        isActive || hasActiveSubmenu ? "scale-110" : "group-hover:scale-110"
                      )}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}

              {/* Submenu */}
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
                                "w-4 h-4 transition-transform duration-200",
                                isSubActive ? "scale-110" : "group-hover:scale-110"
                              )}
                            />
                            <span className="text-sm font-medium">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-800">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Administrador</p>
            <p className="text-xs text-neutral-500 truncate">admin@bazar-mm.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
