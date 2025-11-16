import { Metadata } from 'next';
import CompraForm from '../form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nueva Compra | Bazar M&M',
  description: 'Registrar nueva compra de productos',
};

export default function NuevaCompraPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/compras"
          className="flex items-center gap-2 text-gray-900 hover:text-blue-600 mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Compras
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Compra</h1>
        <p className="text-gray-900 mt-2">
          Puedes cargar un PDF de la orden del proveedor para importar productos automáticamente, 
          o agregar productos manualmente.
        </p>
      </div>

      <CompraForm />
    </div>
  );
}
