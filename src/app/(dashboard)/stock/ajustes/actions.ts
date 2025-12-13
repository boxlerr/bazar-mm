'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type MotivoAjuste = 'inventario' | 'rotura' | 'perdida' | 'regalo' | 'actualizacion' | 'otro';

export async function registrarAjuste(
    productoId: string,
    cantidad: number,
    motivo: MotivoAjuste,
    observaciones: string,
    tipo: 'entrada' | 'salida'
) {
    const supabase = await createClient();

    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    // Calcular cantidad real (negativa si es salida)
    const cantidadReal = tipo === 'salida' ? -Math.abs(cantidad) : Math.abs(cantidad);

    const { error } = await supabase
        .from('ajustes_stock')
        .insert({
            producto_id: productoId,
            usuario_id: user.id,
            cantidad: cantidadReal,
            motivo,
            observaciones
        });

    if (error) {
        console.error('Error al registrar ajuste:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/stock');
    return { success: true };
}

export async function obtenerHistorialMovimientos(productoId: string) {
    const supabase = await createClient();

    // 1. Obtener ajustes manuales
    const { data: ajustes } = await supabase
        .from('ajustes_stock')
        .select('*')
        .eq('producto_id', productoId)
        .order('created_at', { ascending: false });

    // 2. Obtener ventas
    const { data: ventas } = await supabase
        .from('venta_items')
        .select('*, venta:ventas(created_at, nro_ticket)')
        .eq('producto_id', productoId)
        .order('created_at', { ascending: false });

    // 3. Obtener compras
    const { data: compras } = await supabase
        .from('compra_items')
        .select('*, compra:compras(created_at, numero_orden, proveedor:proveedores(nombre))')
        .eq('producto_id', productoId)
        .order('created_at', { ascending: false });

    // Unificar y ordenar
    const movimientos = [
        ...(ajustes || []).map(a => ({
            id: a.id,
            tipo: 'ajuste',
            cantidad: a.cantidad,
            fecha: a.created_at,
            descripcion: `Ajuste: ${a.motivo} - ${a.observaciones || ''}`
        })),
        ...(ventas || []).map(v => ({
            id: v.id,
            tipo: 'venta',
            cantidad: -v.cantidad, // Ventas restan
            fecha: v.venta?.created_at || v.created_at,
            descripcion: `Venta Ticket #${v.venta?.nro_ticket || 'Borrador'}`
        })),
        ...(compras || []).map(c => ({
            id: c.id,
            tipo: 'compra',
            cantidad: c.cantidad, // Compras suman
            fecha: c.compra?.created_at || c.created_at,
            descripcion: `Compra a ${(c.compra?.proveedor as any)?.nombre || 'Proveedor'} (Orden #${c.compra?.numero_orden || '?'})`
        }))
    ];

    return movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}
