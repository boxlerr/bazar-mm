'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Ventas', href: '/ventas', icon: '💰' },
  { name: 'Compras', href: '/compras', icon: '🛒' },
  { name: 'Stock', href: '/stock', icon: '📦' },
  { name: 'Clientes', href: '/clientes', icon: '👥' },
  { name: 'Caja', href: '/caja', icon: '💵' },
  { name: 'Reportes', href: '/reportes', icon: '📊' },
  { name: 'Usuarios', href: '/usuarios', icon: '👤' },
  { name: 'Configuración', href: '/configuracion', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Bazar M&M</h1>
        <p className="text-sm text-gray-400">Sistema ERP</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
