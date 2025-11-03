'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function crearVenta(formData: FormData) {
  const supabase = createServerComponentClient({ cookies });

  // Extraer datos del formulario
  const clienteId = formData.get('cliente_id');
  const items = JSON.parse(formData.get('items') as string);
  const total = parseFloat(formData.get('total') as string);
  const metodoPago = formData.get('metodo_pago');

  try {
    // Crear la venta
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert({
        cliente_id: clienteId,
        total,
        metodo_pago: metodoPago,
        estado: 'completada',
      })
      .select()
      .single();

    if (ventaError) throw ventaError;

    // Insertar items de la venta
    const itemsData = items.map((item: any) => ({
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

    // Actualizar stock de productos
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('actualizar_stock', {
        p_producto_id: item.producto_id,
        p_cantidad: -item.cantidad,
      });

      if (stockError) throw stockError;
    }

    revalidatePath('/ventas');
    return { success: true, venta };
  } catch (error) {
    console.error('Error al crear venta:', error);
    return { success: false, error: 'Error al crear la venta' };
  }
}

export async function actualizarStock(productoId: string, cantidad: number) {
  const supabase = createServerComponentClient({ cookies });

  try {
    const { error } = await supabase.rpc('actualizar_stock', {
      p_producto_id: productoId,
      p_cantidad: cantidad,
    });

    if (error) throw error;

    revalidatePath('/stock');
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    return { success: false, error: 'Error al actualizar el stock' };
  }
}
