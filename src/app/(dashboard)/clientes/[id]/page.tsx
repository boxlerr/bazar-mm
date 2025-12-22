import { getCliente, getMovimientosCuenta } from '../actions';
import ClienteDetalleView from '@/components/clientes/ClienteDetalleView';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cliente = await getCliente(id);

    if (!cliente) {
        notFound();
    }

    const movimientos = await getMovimientosCuenta(id);

    // Cast para asegurar tipos correctos si supabase devuelve tipos parciales
    const clienteTyped = cliente as any;

    return <ClienteDetalleView cliente={clienteTyped} movimientos={movimientos} />;
}
