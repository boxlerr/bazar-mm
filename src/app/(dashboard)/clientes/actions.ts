'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { MovimientoCuentaCorriente } from '@/types/cliente';

export async function crearCliente(formData: FormData) {
    const supabase = await createClient();

    const clienteData = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        dni: formData.get('dni'),
        direccion: formData.get('direccion'),
    };

    const { error } = await supabase.from('clientes').insert(clienteData);

    if (error) {
        return { success: false, error: error.message };
    }

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
        // 1. Registrar movimiento en Cuenta Corriente (Crédito = Baja deuda/Sube saldo a favor, pero aquí "Saldo" es deuda normalmente en sistemas simples? 
        //    Depende: Si Saldo > 0 es Deuda del cliente.
        //    Si cliente paga, Saldo baja.
        //    Credito = Resta al saldo deudor.

        // Obtener saldo actual
        const { data: cliente } = await supabase
            .from('clientes')
            .select('saldo_cuenta_corriente')
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
            tipo: 'credito', // Cliente paga, es un crédito a su cuenta
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

        revalidatePath(`/clientes/${clienteId}`);
        revalidatePath('/clientes');

        return { success: true };
    } catch (error: any) {
        console.error('Error registering payment:', error);
        return { success: false, error: error.message };
    }
}
