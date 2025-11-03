'use client';

import { useState } from 'react';

export default function ArqueoCaja() {
  const [loading, setLoading] = useState(false);

  const handleArqueo = async () => {
    setLoading(true);
    // Implementar lógica de arqueo
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Arqueo de Caja</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Efectivo en Caja
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={4}
            placeholder="Notas sobre el arqueo..."
          />
        </div>

        <button
          onClick={handleArqueo}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Cerrar Caja'}
        </button>
      </div>
    </div>
  );
}
