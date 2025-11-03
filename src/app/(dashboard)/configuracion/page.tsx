import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configuración | Bazar M&M',
  description: 'Configuración general del sistema',
};

export default function ConfiguracionPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información del Negocio
          </h2>
          {/* Formulario de configuración */}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Backup y Respaldo
          </h2>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
            Descargar Backup
          </button>
        </div>
      </div>
    </div>
  );
}
