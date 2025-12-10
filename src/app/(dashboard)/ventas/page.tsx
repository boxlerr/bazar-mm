import { Metadata } from 'next';
import POSLayout from '@/components/ventas/POSLayout';
import Link from 'next/link';
import { History } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Punto de Venta | Bazar M&M',
  description: 'Sistema de facturación y ventas',
};

export default function VentasPage() {
  return (
    <div className="h-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-gray-500">Gestión de ventas y facturación</p>
        </div>
        <Link
          href="/ventas/historial"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          <History className="w-4 h-4" />
          Historial
        </Link>
      </div>

      <POSLayout />
    </div>
  );
}
