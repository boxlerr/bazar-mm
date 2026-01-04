'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { notifyUsers } from '@/lib/notifications';

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

    try {
        // Obtener configuración de notificaciones
        const { getNotificacionesConfig } = await import('@/app/(dashboard)/configuracion/notificaciones/actions');
        const config = await getNotificacionesConfig();

        // 1. Obtener stock actual y datos del producto
        const { data: prod, error: prodError } = await supabase
            .from('productos')
            .select('stock_actual, stock_minimo, nombre')
            .eq('id', productoId)
            .single();

        if (prodError || !prod) throw new Error('Producto no encontrado');

        const stockAnterior = prod.stock_actual;
        const stockNuevo = stockAnterior + cantidadReal;

        // 2. Actualizar stock producto
        const { error: updateError } = await supabase
            .from('productos')
            .update({ stock_actual: stockNuevo })
            .eq('id', productoId);

        if (updateError) throw updateError;

        // 3. Registrar en Kardex
        const { error: kardexError } = await supabase
            .from('movimientos_stock')
            .insert({
                producto_id: productoId,
                usuario_id: user.id,
                tipo: 'ajuste_manual',
                cantidad: cantidadReal,
                stock_anterior: stockAnterior,
                stock_nuevo: stockNuevo,
                motivo: `${motivo} - ${observaciones}`
            });

        if (kardexError) throw kardexError;

        revalidatePath('/stock');

        // Notificar ajuste (Log de acción)
        await notifyUsers(
            ['admin'],
            'Ajuste de Stock',
            `Ajuste manual (${tipo}) de ${cantidad} unidades en producto ${prod.nombre}. Motivo: ${motivo}`,
            'info', // Cambiado a info para no disparar alertas críticas/emails confusos si no es necesario
            'stock',
            productoId,
            `/stock/${productoId}`
        );

        // Verificar stock bajo y notificar ALERTA (que dispara email)
        const limiteStock = prod.stock_minimo ?? config.stock_minimo_global;

        if (stockNuevo <= limiteStock) {
            await notifyUsers(
                ['admin', 'gerente'],
                'Stock Bajo',
                `El producto ${prod.nombre} tiene stock bajo (${stockNuevo} unidades) tras ajuste manual.`,
                'warning',
                'stock',
                productoId,
                `/stock/${productoId}`
            );
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error al registrar ajuste:', error);
        return { success: false, error: error.message || 'Error al registrar ajuste' };
    }
}

export async function obtenerHistorialMovimientos(productoId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('movimientos_stock')
        .select(`
            *,
            usuario:usuarios(nombre)
        `)
        .eq('producto_id', productoId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching kardex:', error);
        return [];
    }

    return data.map((m: any) => ({
        id: m.id,
        tipo: m.tipo === 'ajuste_manual' ? 'ajuste' : m.tipo,
        cantidad: m.cantidad,
        fecha: m.created_at,
        descripcion: m.motivo || 'Sin descripción',
        stock_anterior: m.stock_anterior,
        stock_nuevo: m.stock_nuevo,
        usuario: m.usuario?.nombre || 'Sistema'
    }));
}
