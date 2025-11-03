'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VentaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Implementar lógica de creación de venta
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Venta</h2>
        {/* Campos del formulario */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Venta'}
        </button>
      </div>
    </form>
  );
}
