'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Producto } from '@/types';

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
  metodo_pago: string;
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

    // 0. Validar que haya caja abierta
    const { data: cajaAbierta } = await supabase
      .from('caja')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('estado', 'abierta')
      .single();

    if (!cajaAbierta) {
      return { success: false, error: 'Debe abrir la caja antes de realizar una venta.' };
    }

    // 1. Crear la venta
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert({
        cliente_id: saleData.cliente_id,
        subtotal: saleData.subtotal,
        total: saleData.total,
        metodo_pago: saleData.metodo_pago,
        descuento: saleData.descuento || 0,
        estado: 'completada',
        usuario_id: user.id // Asignar explícitamente el usuario
      })
      .select('*, clientes(nombre)')
      .single();

    if (ventaError) {
      console.error('Error creating sale:', ventaError);
      throw new Error(`Error al crear venta: ${ventaError.message}`);
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

    // 3. Actualizar stock
    for (const item of saleData.items) {
      const { error: rpcError } = await supabase.rpc('actualizar_stock', {
        p_producto_id: item.producto_id,
        p_cantidad: -item.cantidad,
      });

      if (rpcError) {
        console.warn('RPC actualizar_stock failed, trying manual update', rpcError);
        const { data: prod } = await supabase.from('productos').select('stock_actual').eq('id', item.producto_id).single();
        if (prod) {
          await supabase
            .from('productos')
            .update({ stock_actual: prod.stock_actual - item.cantidad })
            .eq('id', item.producto_id);
        }
      }
    }

    // 4. Si es venta en efectivo, registrar movimiento en caja
    if (saleData.metodo_pago === 'efectivo') {
      // Buscar caja abierta del usuario
      const { data: caja } = await supabase
        .from('caja')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single();

      if (caja) {
        await supabase.from('movimientos_caja').insert({
          caja_id: caja.id,
          tipo: 'ingreso',
          concepto: `Venta Ticket #${venta.nro_ticket}`,
          monto: saleData.total,
          venta_id: venta.id
        });
      }
    }

    revalidatePath('/ventas');
    revalidatePath('/stock');
    revalidatePath('/reportes');

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
      clientes (nombre)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching sales history:', JSON.stringify(error, null, 2));
    return [];
  }

  return data;
}
