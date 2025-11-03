'use client';

export default function ClienteDetalle({ cliente }: { cliente: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{cliente.nombre}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{cliente.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            <p className="font-semibold">{cliente.telefono}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">DNI/CUIT</p>
            <p className="font-semibold">{cliente.dni}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Saldo Cuenta Corriente</p>
            <p className="font-semibold text-lg">
              ${cliente.saldo_cuenta_corriente?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Historial de Compras</h3>
        {/* Tabla de compras del cliente */}
      </div>
    </div>
  );
}
