'use client';

import { useState } from 'react';

export default function CompraForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Implementar lógica de creación de compra
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Registrar Compra</h2>
        {/* Campos del formulario */}
      </div>
    </form>
  );
}
