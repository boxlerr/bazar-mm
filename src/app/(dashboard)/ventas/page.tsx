import { Metadata } from 'next';
import POSLayout from '@/components/ventas/POSLayout';

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
        {/* Aquí podríamos poner un link al historial de ventas si se desea */}
      </div>

      <POSLayout />
    </div>
  );
}
