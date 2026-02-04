'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Producto } from '@/types';
import { notifyUsers } from '@/lib/notifications';

export async function searchProducts(query: string) {
  const supabase = await createClient();

  // Buscar por nombre o código de barras
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .or(`nombre.ilike.%${query}%,codigo.eq.${query},codigo_barra.eq.${query}`)
    .eq('activo', true)
    .limit(10);

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data as Producto[];
}

export async function processSale(saleData: {
  cliente_id?: string;
  items: { producto_id: string; cantidad: number; precio_unitario: number }[];
  subtotal: number;
  total: number;
  pagos: { metodo: string; monto: number }[];
  descuento?: number;
}) {
  const supabase = await createClient();

  try {
    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('No se pudo autenticar al usuario para registrar la venta');
    }

    // 0. Validar que haya caja abierta si hay pagos en efectivo
    const hayEfectivo = saleData.pagos.some(p => p.metodo === 'efectivo');
    let cajaId = null;

    if (hayEfectivo) {
      const { data: cajaAbierta } = await supabase
        .from('caja')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single();

      if (!cajaAbierta) {
        return { success: false, error: 'Debe abrir la caja antes de realizar una venta en efectivo.' };
      }
      cajaId = cajaAbierta.id;
    }

    // Obtener configuración de notificaciones
    const { getNotificacionesConfig } = await import('@/app/(dashboard)/configuracion/notificaciones/actions');
    const config = await getNotificacionesConfig();

    // Determinar metodo de pago principal para la tabla ventas
    const metodoPrincipal = saleData.pagos.length > 1 ? 'multiple' : saleData.pagos[0].metodo;

    // 1. Crear la venta
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert({
        cliente_id: saleData.cliente_id,
        subtotal: saleData.subtotal,
        total: saleData.total,
        metodo_pago: metodoPrincipal,
        descuento: saleData.descuento || 0,
        estado: 'completada',
        usuario_id: user.id
      })
      .select('*, clientes(nombre), usuarios(nombre)')
      .single();

    if (ventaError) {
      console.error('Error creating sale:', ventaError);
      throw new Error(`Error al crear venta: ${ventaError.message}`);
    }

    // 1.5 Registrar Pagos Detallados
    const pagosData = saleData.pagos.map(p => ({
      venta_id: venta.id,
      metodo: p.metodo,
      monto: p.monto
    }));

    const { error: pagosError } = await supabase
      .from('pagos')
      .insert(pagosData);

    if (pagosError) {
      console.error('Error creating payments:', pagosError);
      // No fallamos toda la venta, pero loggeamos
    }

    // 2. Insertar items
    const itemsData = saleData.items.map((item) => ({
      venta_id: venta.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
    }));

    const { error: itemsError } = await supabase
      .from('venta_items')
      .insert(itemsData);

    if (itemsError) {
      console.error('Error creating items:', itemsError);
      throw new Error(`Error al crear items: ${itemsError.message}`);
    }

    // 3. Registrar movimiento y verificar stock bajo
    for (const item of saleData.items) {
      // Obtener stock actual para registrar el movimiento (referencial)
      const { data: prod } = await supabase
        .from('productos')
        .select('stock_actual, stock_minimo, nombre')
        .eq('id', item.producto_id)
        .single();

      // Calculamos el nuevo stock (aproximado, asumiendo trigger)
      const stockAnterior = prod?.stock_actual || 0;
      const stockNuevo = stockAnterior - item.cantidad;

      const limiteStock = prod?.stock_minimo ?? config.stock_minimo_global;

      if (stockNuevo <= limiteStock) {
        await notifyUsers(
          ['admin', 'gerente', 'vendedor'],
          'Stock Bajo',
          `El producto ${prod?.nombre || 'Desconocido'} tiene stock bajo (${stockNuevo} unidades)`,
          'warning',
          'stock',
          item.producto_id,
          `/stock/${item.producto_id}`
        );
      }

      // Registrar movimiento en Kardex
      await supabase.from('movimientos_stock').insert({
        producto_id: item.producto_id,
        usuario_id: user.id,
        tipo: 'venta',
        cantidad: -item.cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        motivo: `Venta Ticket #${venta.nro_ticket}`,
        referencia_id: venta.id
      });
    }

    // 4. Procesar Movimientos Financieros (Caja / Cuenta Corriente)
    for (const pago of saleData.pagos) {
      if (pago.metodo === 'efectivo' && cajaId) {
        await supabase.from('movimientos_caja').insert({
          caja_id: cajaId,
          tipo: 'ingreso',
          concepto: `Venta Ticket #${venta.nro_ticket} (Efectivo)`,
          monto: pago.monto,
          venta_id: venta.id
        });
      } else if (pago.metodo === 'cuenta_corriente' && saleData.cliente_id) {
        await supabase.from('movimientos_cuenta_corriente').insert({
          cliente_id: saleData.cliente_id,
          tipo: 'debito',
          monto: pago.monto,
          descripcion: `Compra Ticket #${venta.nro_ticket}`,
          venta_id: venta.id
        });
      }
    }

    revalidatePath('/ventas');
    revalidatePath('/stock');
    revalidatePath('/reportes');

    // Notificar a Admin y Gerente
    const nombreVendedor = (venta.usuarios as any)?.nombre || 'Sistema';
    await notifyUsers(
      ['admin', 'gerente'],
      'Nueva Venta',
      `Venta registrada por ${nombreVendedor} - $${saleData.total} (Ticket #${venta.nro_ticket})`,
      'success',
      'ventas',
      venta.id,
      `/ventas/${venta.id}`
    );

    return { success: true, venta };
  } catch (error: any) {
    console.error('Error processing sale:', error);
    return { success: false, error: error.message || 'Error al procesar la venta' };
  }
}

export async function getSalesHistory() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      clientes (nombre),
      usuarios (nombre),
      venta_items (
        cantidad,
        precio_unitario,
        productos (nombre)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching sales history:', JSON.stringify(error, null, 2));
    return [];
  }

  return data;
}

export async function getDataForEditSale() {
  const supabase = await createClient();

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre')
    .order('nombre');

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('id, nombre')
    .order('nombre');

  return {
    clientes: clientes || [],
    usuarios: usuarios || []
  };
}

export async function updateSale(saleId: string, data: {
  created_at: string;
  cliente_id?: string;
  usuario_id?: string;
  metodo_pago: string;
  total: number;
}) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ventas')
      .update({
        created_at: data.created_at,
        cliente_id: data.cliente_id || null,
        usuario_id: data.usuario_id || null,
        metodo_pago: data.metodo_pago,
        total: data.total
      })
      .eq('id', saleId);

    if (error) throw error;

    revalidatePath('/ventas');
    revalidatePath('/reportes');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating sale:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSale(saleId: string) {
  const supabase = await createClient();

  try {
    // 1. Eliminar dependencias manualmente para evitar error de FK
    await supabase.from('movimientos_caja').delete().eq('venta_id', saleId);
    await supabase.from('movimientos_cuenta_corriente').delete().eq('venta_id', saleId);
    await supabase.from('movimientos_stock').delete().eq('referencia_id', saleId); // En mov stock usamos referencia_id
    await supabase.from('venta_items').delete().eq('venta_id', saleId);

    // 2. Eliminar la venta
    const { error } = await supabase
      .from('ventas')
      .delete()
      .eq('id', saleId);

    if (error) throw error;

    revalidatePath('/ventas');
    revalidatePath('/reportes');
    revalidatePath('/stock');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting sale:', error);
    return { success: false, error: error.message };
  }
}
