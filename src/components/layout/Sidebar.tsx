'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';

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
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white h-screen flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Bazar M&M
        </h1>
        <p className="text-sm text-slate-400 mt-1">Sistema de Gestión</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive || hasActiveSubmenu
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive || hasActiveSubmenu ? 'scale-110' : 'group-hover:scale-110'
                      }`}
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}

              {/* Submenu */}
              {hasSubmenu && isExpanded && (
                <div className="ml-4 pl-4 border-l-2 border-slate-700/50 space-y-1 animate-slideDown">
                  {item.submenu!.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    const SubIcon = subItem.icon;

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                          isSubActive
                            ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-400'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                      >
                        <SubIcon 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isSubActive ? 'scale-110' : 'group-hover:scale-110'
                          }`}
                        />
                        <span className="text-sm font-medium">{subItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-slate-900 font-bold text-sm">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-slate-400 truncate">admin@bazar-mm.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
