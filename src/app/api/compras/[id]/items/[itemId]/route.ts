import { createActionClient } from '@/lib/supabase/action';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: compraId, itemId } = await params;
    const body = await request.json();
    const { cantidad, precio_unitario, subtotal, producto } = body;

    const supabase = await createActionClient();

    // Primero obtener la cantidad anterior y el producto_id
    const { data: itemAnterior } = await supabase
      .from('compra_items')
      .select('cantidad, producto_id')
      .eq('id', itemId)
      .single();

    if (!itemAnterior) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    const cantidadAnterior = itemAnterior.cantidad;
    const diferenciaStock = cantidad - cantidadAnterior;

    // Actualizar el item de compra
    const { error: itemError } = await supabase
      .from('compra_items')
      .update({
        cantidad,
        precio_unitario,
        subtotal,
      })
      .eq('id', itemId)
      .eq('compra_id', compraId);

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 400 });
    }

    // Actualizar el stock del producto si cambió la cantidad
    if (diferenciaStock !== 0) {
      const { data: productoActual } = await supabase
        .from('productos')
        .select('stock_actual')
        .eq('id', itemAnterior.producto_id)
        .single();

      if (productoActual) {
        const nuevoStock = productoActual.stock_actual + diferenciaStock;
        await supabase
          .from('productos')
          .update({ stock_actual: nuevoStock })
          .eq('id', itemAnterior.producto_id);
      }
    }

    // Si se envió información del producto, actualizarlo también
    if (producto) {
      const { error: productoError } = await supabase
        .from('productos')
        .update({
          nombre: producto.nombre,
          codigo_barra: producto.codigo_barra,
          categoria: producto.categoria,
          units_per_pack: producto.units_per_pack,
        })
        .eq('id', itemAnterior.producto_id);

      if (productoError) {
        console.error('Error actualizando producto:', productoError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error actualizando item:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
