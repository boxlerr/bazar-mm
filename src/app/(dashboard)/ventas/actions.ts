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
  total: number;
  metodo_pago: string;
  descuento?: number;
}) {
  const supabase = await createClient();

  try {
    // 1. Crear la venta
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert({
        cliente_id: saleData.cliente_id,
        total: saleData.total,
        metodo_pago: saleData.metodo_pago,
        descuento: saleData.descuento || 0,
        estado: 'completada',
        // usuario_id se asigna automáticamente por trigger o default en BD si está configurado,
        // sino deberíamos obtenerlo del auth.getUser() aquí.
        // Asumimos que la tabla tiene default auth.uid() o similar.
      })
      .select('*, clientes(nombre)') // Traer nombre cliente para ticket
      .single();

    if (ventaError) throw ventaError;

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

    if (itemsError) throw itemsError;

    // 3. Actualizar stock
    // Nota: Idealmente esto se hace con un trigger en BD o una función RPC para atomicidad.
    // Usamos RPC 'actualizar_stock' si existe, sino update manual.
    for (const item of saleData.items) {
      // Intento llamar a RPC primero
      const { error: rpcError } = await supabase.rpc('actualizar_stock', {
        p_producto_id: item.producto_id,
        p_cantidad: -item.cantidad,
      });

      if (rpcError) {
        // Fallback si no existe RPC (aunque debería por el código anterior)
        // Ojo: esto no es atómico si falla a la mitad.
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

    revalidatePath('/ventas');
    revalidatePath('/stock');
    revalidatePath('/reportes');

    return { success: true, venta };
  } catch (error) {
    console.error('Error processing sale:', error);
    return { success: false, error: 'Error al procesar la venta' };
  }
}
