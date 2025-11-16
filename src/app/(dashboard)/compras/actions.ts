'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CompraItemForm } from '@/types/compra';

export async function crearCompra(formData: FormData) {
  const supabase = await createClient();

  try {
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Extraer datos del FormData
    const proveedor_id = formData.get('proveedor_id') as string;
    const numero_orden = formData.get('numero_orden') as string;
    const metodo_pago = formData.get('metodo_pago') as string;
    const observaciones = formData.get('observaciones') as string;
    const total = parseFloat(formData.get('total') as string);
    const itemsJson = formData.get('items') as string;
    const pdfFile = formData.get('pdf') as File | null;
    
    const items: CompraItemForm[] = JSON.parse(itemsJson);

    // Validaciones
    if (!proveedor_id || items.length === 0) {
      return { success: false, error: 'Datos incompletos' };
    }

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
      console.error('Error creando compra:', compraError);
      return { success: false, error: 'Error al crear la compra' };
    }

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

      // Actualizar stock del producto
      const { data: currentProduct } = await supabase
        .from('productos')
        .select('stock_actual')
        .eq('id', producto_id)
        .single();

      if (currentProduct) {
        await supabase
          .from('productos')
          .update({
            stock_actual: currentProduct.stock_actual + item.cantidad,
            precio_costo: item.precio_costo,
            precio_venta: item.precio_venta,
          })
          .eq('id', producto_id);
      }
    }

    revalidatePath('/compras');
    revalidatePath('/stock');
    
    return { success: true, compra_id: compra.id };
    
  } catch (error) {
    console.error('Error en crearCompra:', error);
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
