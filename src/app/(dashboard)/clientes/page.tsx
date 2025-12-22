import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Clientes | Bazar M&M',
  description: 'Gestión de clientes y cuentas corrientes',
};

export default async function ClientesPage() {
  const supabase = await createClient();

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Link
          href="/clientes/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes?.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cliente.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.telefono}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${cliente.saldo_cuenta_corriente?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
