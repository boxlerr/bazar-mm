import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Compras | Bazar M&M',
  description: 'Gestión de compras y reposición de stock',
};

export default function ComprasPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
        <Link
          href="/compras/nueva"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Nueva Compra
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Módulo de compras y reposición de inventario</p>
      </div>
    </div>
  );
}
