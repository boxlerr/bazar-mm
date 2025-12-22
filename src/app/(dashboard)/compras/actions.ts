'use server';

import { createActionClient } from '@/lib/supabase/action';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CompraItemForm } from '@/types/compra';

export async function crearCompra(formData: FormData) {
  console.log('🚀 crearCompra: Iniciando server action...');

  try {
    // Crear cliente compatible con server actions
    const supabase = await createActionClient();
    console.log('✅ crearCompra: Cliente Supabase creado');

    // Obtener usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ crearCompra: Error obteniendo usuario:', userError);
      return { success: false, error: 'Usuario no autenticado' };
    }

    console.log('✅ crearCompra: Usuario autenticado:', user.email, 'ID:', user.id);

    // Extraer datos del FormData
    const proveedor_id = formData.get('proveedor_id') as string;
    const numero_orden = formData.get('numero_orden') as string;
    const metodo_pago = formData.get('metodo_pago') as string;
    const observaciones = formData.get('observaciones') as string;
    const total = parseFloat(formData.get('total') as string);
    const itemsJson = formData.get('items') as string;
    const pdfFile = formData.get('pdf') as File | null;

    console.log('📋 crearCompra: Datos extraídos:', { proveedor_id, numero_orden, metodo_pago, total });

    const items: CompraItemForm[] = JSON.parse(itemsJson);
    console.log('📦 crearCompra: Items parseados:', items.length);

    // Validaciones
    if (!proveedor_id || items.length === 0) {
      console.error('❌ crearCompra: Validación fallida:', { proveedor_id, items_count: items.length });
      return { success: false, error: 'Datos incompletos' };
    }

    console.log('✅ crearCompra: Validaciones pasadas');

    // Subir PDF si existe
    let pdf_url: string | null = null;
    if (pdfFile) {
      const fileName = `compras/${Date.now()}-${pdfFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, pdfFile);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('documentos')
          .getPublicUrl(fileName);
        pdf_url = urlData.publicUrl;
      }
    }

    // Iniciar transacción: crear compra
    console.log('💾 crearCompra: Insertando en DB...');
    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .insert({
        proveedor_id,
        usuario_id: user.id,
        numero_orden,
        total,
        metodo_pago,
        estado: 'completada',
        observaciones,
        pdf_url,
      })
      .select()
      .single();

    if (compraError || !compra) {
      console.error('❌ crearCompra: Error en DB:', compraError);
      return { success: false, error: 'Error al crear la compra' };
    }

    console.log('✅ crearCompra: Compra creada con ID:', compra.id);

    // Procesar cada item
    for (const item of items) {
      let producto_id = item.producto_id;

      // Si el producto no existe, crearlo
      if (!producto_id || item.es_nuevo) {
        // Verificar si existe por código o SKU
        const { data: existingProduct } = await supabase
          .from('productos')
          .select('id')
          .or(`codigo.eq.${item.codigo},codigo_barra.eq.${item.sku}`)
          .single();

        if (existingProduct) {
          producto_id = existingProduct.id;
        } else {
          // Crear nuevo producto
          const { data: newProduct, error: productError } = await supabase
            .from('productos')
            .insert({
              codigo: item.codigo || `PROD-${Date.now()}`,
              codigo_barra: item.sku || null,
              nombre: item.nombre,
              categoria: item.categoria,
              precio_costo: item.precio_costo,
              precio_venta: item.precio_venta,
              stock_actual: 0,
              stock_minimo: 0,
              proveedor_id,
              activo: true,
            })
            .select()
            .single();

          if (productError || !newProduct) {
            console.error('Error creando producto:', productError);
            continue;
          }

          producto_id = newProduct.id;
        }
      }

      // Crear item de compra
      const { error: itemError } = await supabase
        .from('compra_items')
        .insert({
          compra_id: compra.id,
          producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_costo,
          subtotal: item.cantidad * item.precio_costo,
        });

      if (itemError) {
        console.error('Error creando item de compra:', itemError);
        continue;
      }

      // Actualizar stock del producto y registrar en Kardex
      const { data: currentProduct } = await supabase
        .from('productos')
        .select('stock_actual')
        .eq('id', producto_id)
        .single();

      if (currentProduct) {
        const stockAnterior = currentProduct.stock_actual;
        const stockNuevo = stockAnterior + item.cantidad;

        await supabase
          .from('productos')
          .update({
            stock_actual: stockNuevo,
            precio_costo: item.precio_costo,
            precio_venta: item.precio_venta,
          })
          .eq('id', producto_id);

        // Registrar en Kardex
        await supabase.from('movimientos_stock').insert({
          producto_id,
          usuario_id: user.id,
          tipo: 'compra',
          cantidad: item.cantidad,
          stock_anterior: stockAnterior,
          stock_nuevo: stockNuevo,
          motivo: `Compra Orden #${numero_orden}`,
          referencia_id: compra.id
        });
      }
    }

    revalidatePath('/compras');
    revalidatePath('/stock');

    console.log('✅ crearCompra: Proceso completado exitosamente!');
    return { success: true, compra_id: compra.id };

  } catch (error) {
    console.error('❌ crearCompra: Error capturado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

export async function obtenerCompras() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('compras')
    .select(`
      *,
      proveedor:proveedores(nombre),
      items:compra_items(
        cantidad,
        precio_unitario,
        subtotal,
        producto:productos(nombre, codigo)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo compras:', error);
    return [];
  }

  return data || [];
}

export async function obtenerProveedores() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('proveedores')
    .select('id, nombre, razon_social')
    .eq('activo', true)
    .order('nombre');

  if (error) {
    console.error('Error obteniendo proveedores:', error);
    return [];
  }

  return data || [];
}

export async function eliminarCompra(id: string) {
  try {
    const supabase = await createActionClient();

    // 1. Obtener los items de la compra para revertir el stock
    const { data: items, error: itemsError } = await supabase
      .from('compra_items')
      .select('producto_id, cantidad')
      .eq('compra_id', id);

    if (itemsError) throw new Error('Error al obtener items de la compra');

    // Obtener usuario para el log
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Revertir el stock de cada producto
    for (const item of items) {
      const { data: producto } = await supabase
        .from('productos')
        .select('stock_actual')
        .eq('id', item.producto_id)
        .single();

      if (producto) {
        const stockAnterior = producto.stock_actual;
        const stockNuevo = Math.max(0, stockAnterior - item.cantidad);

        await supabase
          .from('productos')
          .update({ stock_actual: stockNuevo })
          .eq('id', item.producto_id);

        // Registrar en Kardex (Reversión de compra)
        if (user) {
          await supabase.from('movimientos_stock').insert({
            producto_id: item.producto_id,
            usuario_id: user.id,
            tipo: 'ajuste_manual', // O 'devolucion' si existiera en el enum
            cantidad: -item.cantidad,
            stock_anterior: stockAnterior,
            stock_nuevo: stockNuevo,
            motivo: `Anulación Compra (ID: ${id.slice(0, 8)})`,
            referencia_id: id
          });
        }
      }
    }

    // 3. Eliminar la compra (los items se eliminan por cascada si está configurado, 
    // pero por seguridad eliminamos items primero si no hay cascada, aunque aquí asumimos cascada o borrado directo)
    // Supabase suele manejar cascada si está configurado en la FK. Si no, deberíamos borrar items primero.
    // Vamos a intentar borrar la compra directamente.
    const { error: deleteError } = await supabase
      .from('compras')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    revalidatePath('/compras');
    revalidatePath('/stock');

    return { success: true };
  } catch (error) {
    console.error('Error eliminando compra:', error);
    return { success: false, error: 'Error al eliminar la compra' };
  }
}
