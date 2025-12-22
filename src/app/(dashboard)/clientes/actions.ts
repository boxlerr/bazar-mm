'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { MovimientoCuentaCorriente } from '@/types/cliente';
import { notifyUsers } from '@/lib/notifications';

async function getActorName(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'Alguien';

    const { data: perfil } = await supabase
        .from('usuarios')
        .select('nombre')
        .eq('id', user.id)
        .single();

    return perfil?.nombre || 'Alguien';
}

export async function crearCliente(formData: FormData) {
    const supabase = await createClient();
    const actorName = await getActorName(supabase);

    const clienteData = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        dni: formData.get('dni'),
        direccion: formData.get('direccion'),
    };

    const { data, error } = await supabase.from('clientes').insert(clienteData).select('id').single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Notificar nuevo cliente
    await notifyUsers(
        ['admin', 'gerente', 'vendedor'],
        'Nuevo Cliente',
        `${actorName} ha registrado al cliente ${clienteData.nombre}`,
        'info',
        'clientes',
        data.id,
        `/clientes/${data.id}`
    );

    revalidatePath('/clientes');
    return { success: true };
}

export async function actualizarCliente(id: string, formData: FormData) {
    const supabase = await createClient();

    const clienteData = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        dni: formData.get('dni'),
        direccion: formData.get('direccion'),
    };

    const { error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/clientes');
    return { success: true };
}

export async function getCliente(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching client:', error);
        return null;
    }

    return data;
}

export async function getMovimientosCuenta(clienteId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('movimientos_cuenta_corriente')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching movements:', error);
        return [];
    }

    return data as MovimientoCuentaCorriente[];
}

export async function registrarPago(
    clienteId: string,
    monto: number,
    metodoPago: string,
    notas?: string
) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    // Validar caja abierta
    const { data: cajaAbierta } = await supabase
        .from('caja')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single();

    if (!cajaAbierta) {
        return { success: false, error: 'Debe abrir la caja antes de registrar un pago.' };
    }

    try {
        const actorName = await getActorName(supabase);

        // 1. Registrar movimiento en Cuenta Corriente
        const { data: cliente } = await supabase
            .from('clientes')
            .select('saldo_cuenta_corriente, nombre')
            .eq('id', clienteId)
            .single();

        const nuevoSaldo = (cliente?.saldo_cuenta_corriente || 0) - monto;

        const { error: updateError } = await supabase
            .from('clientes')
            .update({ saldo_cuenta_corriente: nuevoSaldo })
            .eq('id', clienteId);

        if (updateError) throw updateError;

        // 2. Registrar el movimiento histórico
        await supabase.from('movimientos_cuenta_corriente').insert({
            cliente_id: clienteId,
            tipo: 'credito',
            monto: monto,
            descripcion: `Pago recibido (${metodoPago}). ${notas || ''}`
        });

        // 3. Registrar ingreso en caja
        await supabase.from('movimientos_caja').insert({
            caja_id: cajaAbierta.id,
            tipo: 'ingreso',
            concepto: `Pago Cliente #${clienteId.slice(0, 8)}`,
            monto: monto
        });

        // Notificar pago
        await notifyUsers(
            ['admin', 'gerente'],
            'Pago Recibido',
            `${actorName} registró un pago de $${monto} del cliente ${cliente?.nombre || 'Desconocido'}`,
            'success',
            'clientes',
            clienteId,
            `/clientes/${clienteId}`
        );

        revalidatePath(`/clientes/${clienteId}`);
        revalidatePath('/clientes');

        return { success: true };
    } catch (error: any) {
        console.error('Error registering payment:', error);
        return { success: false, error: error.message };
    }
}

export async function eliminarCliente(id: string) {
    const supabase = await createClient();
    const actorName = await getActorName(supabase);

    const { error } = await supabase
        .from('clientes')
        .update({ activo: false })
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar cliente:', error);
        return { success: false, error: error.message };
    }

    // Notificar eliminación
    await notifyUsers(
        ['admin', 'gerente'],
        'Cliente Eliminado',
        `${actorName} ha eliminado (archivado) un cliente.`,
        'warning',
        'clientes',
        id
    );

    revalidatePath('/clientes');
    return { success: true };
}
