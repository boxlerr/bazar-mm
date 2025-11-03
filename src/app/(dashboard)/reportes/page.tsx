import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reportes | Bazar M&M',
  description: 'Panel de reportes y exportaciones',
};

export default function ReportesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Reporte de Ventas
          </h3>
          <p className="text-gray-600 mb-4">Exportar ventas por período</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            Generar
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Reporte de Stock
          </h3>
          <p className="text-gray-600 mb-4">Estado actual del inventario</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            Generar
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cuentas Corrientes
          </h3>
          <p className="text-gray-600 mb-4">Saldos de clientes</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            Generar
          </button>
        </div>
      </div>
    </div>
  );
}
