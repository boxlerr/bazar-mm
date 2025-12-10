'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCajaState() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Buscar caja abierta del usuario actual
    const { data: caja } = await supabase
        .from('caja')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single();

    if (!caja) return null;

    // Calcular totales
    const { data: movimientos } = await supabase
        .from('movimientos_caja')
        .select('*')
        .eq('caja_id', caja.id);

    const totalIngresos = movimientos
        ?.filter(m => m.tipo === 'ingreso')
        .reduce((sum, m) => sum + m.monto, 0) || 0;

    const totalEgresos = movimientos
        ?.filter(m => m.tipo === 'egreso')
        .reduce((sum, m) => sum + m.monto, 0) || 0;

    return {
        ...caja,
        totalIngresos,
        totalEgresos,
        saldoActual: caja.saldo_inicial + totalIngresos - totalEgresos
    };
}

export async function getMovimientos(cajaId: string) {
    const supabase = await createClient();

    const { data } = await supabase
        .from('movimientos_caja')
        .select('*, ventas(nro_ticket)')
        .eq('caja_id', cajaId)
        .order('created_at', { ascending: false });

    return data || [];
}

export async function abrirCaja(montoInicial: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Usuario no autenticado' };

    // Verificar si ya tiene caja abierta
    const { data: cajaAbierta } = await supabase
        .from('caja')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single();

    if (cajaAbierta) {
        return { success: false, error: 'Ya tienes una caja abierta' };
    }

    const { error } = await supabase
        .from('caja')
        .insert({
            usuario_id: user.id,
            saldo_inicial: montoInicial,
            estado: 'abierta',
            fecha_apertura: new Date().toISOString()
        });

    if (error) {
        console.error('Error opening caja:', error);
        return { success: false, error: 'Error al abrir la caja' };
    }

    revalidatePath('/caja');
    return { success: true };
}

export async function cerrarCaja(cajaId: string, saldoFinal: number, observaciones: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('caja')
        .update({
            estado: 'cerrada',
            saldo_final: saldoFinal,
            fecha_cierre: new Date().toISOString(),
            observaciones
        })
        .eq('id', cajaId);

    if (error) {
        console.error('Error closing caja:', error);
        return { success: false, error: 'Error al cerrar la caja' };
    }

    revalidatePath('/caja');
    return { success: true };
}

export async function registrarMovimiento(cajaId: string, tipo: 'ingreso' | 'egreso', monto: number, concepto: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('movimientos_caja')
        .insert({
            caja_id: cajaId,
            tipo,
            monto,
            concepto,
            created_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error registering movement:', error);
        return { success: false, error: 'Error al registrar movimiento' };
    }

    revalidatePath('/caja');
    return { success: true };
}
