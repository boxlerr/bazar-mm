import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 API /api/compras: Iniciando...');

  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });

  try {
    // Obtener sesión
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔐 API /api/compras: Session obtenida:', session ? 'Sí' : 'No');

    if (!session?.user) {
      console.error('❌ API /api/compras: Usuario no autenticado');
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const user = session.user;
    console.log('👤 API /api/compras: Usuario autenticado:', user.email);

    // Obtener FormData
    const formData = await request.formData();

    const proveedor_id = formData.get('proveedor_id') as string;
    const numero_orden = formData.get('numero_orden') as string;
    const metodo_pago = formData.get('metodo_pago') as string;
    const observaciones = formData.get('observaciones') as string;
    const total = parseFloat(formData.get('total') as string);
    const itemsJson = formData.get('items') as string;
    const pdfFile = formData.get('pdf') as File | null;

    console.log('📋 API /api/compras: Datos extraídos:', { proveedor_id, numero_orden, metodo_pago, total });

    const items = JSON.parse(itemsJson);
    console.log('📦 API /api/compras: Items parseados:', items.length);

    // Validaciones
    if (!proveedor_id || items.length === 0) {
      console.error('❌ API /api/compras: Validación fallida:', { proveedor_id, items_count: items.length });
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    console.log('✅ API /api/compras: Validaciones pasadas');

    // Subir PDF si existe
    let pdf_url: string | null = null;
    if (pdfFile && pdfFile.size > 0) {
      console.log('📄 API /api/compras: Subiendo PDF...');
      const fileName = `compras/${Date.now()}-${pdfFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, pdfFile);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('documentos')
          .getPublicUrl(fileName);
        pdf_url = urlData.publicUrl;
        console.log('✅ API /api/compras: PDF subido');
      } else {
        console.error('⚠️ API /api/compras: Error subiendo PDF:', uploadError);
      }
    }

    // Crear compra
    console.log('💾 API /api/compras: Insertando compra en DB...');
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
      console.error('❌ API /api/compras: Error en DB:', compraError);
      return NextResponse.json(
        { success: false, error: 'Error al crear la compra' },
        { status: 500 }
      );
    }

    console.log('✅ API /api/compras: Compra creada con ID:', compra.id);

    // Procesar cada item
    console.log('🔄 API /api/compras: Procesando items...');
    let itemsCreados = 0;

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
            console.error('⚠️ API /api/compras: Error creando producto:', productError);
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
        console.error('⚠️ API /api/compras: Error creando item:', itemError);
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

      itemsCreados++;
    }

    console.log(`✅ API /api/compras: Proceso completado! Items creados: ${itemsCreados}/${items.length}`);

    return NextResponse.json({
      success: true,
      compra_id: compra.id,
      items_creados: itemsCreados
    });

  } catch (error) {
    console.error('❌ API /api/compras: Error capturado:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
