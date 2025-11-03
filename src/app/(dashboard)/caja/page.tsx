import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caja | Bazar M&M',
  description: 'Control de caja diaria',
};

export default function CajaPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Control de Caja</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Saldo Inicial</p>
          <p className="text-3xl font-bold text-gray-900">$0.00</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Ingresos del Día</p>
          <p className="text-3xl font-bold text-green-600">$0.00</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Saldo Final</p>
          <p className="text-3xl font-bold text-blue-600">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Movimientos de Hoy</h2>
        {/* Tabla de movimientos */}
      </div>
    </div>
  );
}
