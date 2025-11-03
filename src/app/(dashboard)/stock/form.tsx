'use client';

import { useState } from 'react';

export default function ProductoForm({ producto }: { producto?: any }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Implementar lógica
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {producto ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        {/* Campos del formulario */}
      </div>
    </form>
  );
}
