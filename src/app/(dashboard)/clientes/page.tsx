import { Metadata } from 'next';
import Link from 'next/link';
import ClientsList from '@/components/clientes/ClientsList';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Clientes',
};

export default async function ClientesPage() {
  const supabase = await createClient();

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
      </div>

      {/* Typed as any for safety if types mismatch slightly */}
      <ClientsList initialClientes={clientes as any} />
    </div>
  );
}
