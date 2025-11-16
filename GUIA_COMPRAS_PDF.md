# Sistema de Compras con Carga de PDF

## 🎯 Funcionalidad Implementada

El módulo de compras ahora permite cargar PDFs de órdenes de compra y extraer automáticamente los productos con sus códigos SKU para facilitar la gestión del inventario y el uso de lectores de código de barras.

## ✨ Características

### 1. **Carga Automática desde PDF**
- Sube el PDF de la orden del proveedor (ej: Orden #2527 de D&G)
- Extrae automáticamente:
  - Número de orden
  - Lista de productos con cantidades
  - Códigos SKU
  - Precios unitarios y totales

### 2. **Gestión Inteligente de Productos**
- **Productos nuevos**: Se crean automáticamente en el inventario
- **Productos existentes**: Se actualizan precios y stock
- **Código SKU**: Se guarda como `codigo_barra` para lectores de código
- **Categorización**: Asigna categorías a los productos
- **Precios**: Calcula precio de venta con margen del 50% por defecto

### 3. **Actualización Automática de Stock**
- Al confirmar la compra, el stock se actualiza automáticamente
- Los productos aparecen inmediatamente en el inventario
- Los códigos SKU están listos para usar con lectores de código

### 4. **Edición Manual**
- Todos los datos extraídos del PDF son editables
- Puedes agregar productos manualmente
- Ajustar cantidades, precios y categorías

## 🚀 Cómo Usar

### Paso 1: Aplicar Migraciones
Primero, aplica las migraciones necesarias en tu base de datos Supabase:

```sql
-- Ejecutar en Supabase SQL Editor:
-- 004_compras_pdf_support.sql
-- 005_seed_proveedores.sql
```

### Paso 2: Configurar Storage en Supabase
1. Ve a **Storage** en Supabase
2. Verifica que el bucket `documentos` esté creado
3. Las políticas de acceso ya están configuradas en la migración

### Paso 3: Registrar una Compra
1. Ve a **Compras** en el dashboard
2. Haz clic en **+ Nueva Compra**
3. **Carga el PDF** de la orden del proveedor
4. Espera unos segundos mientras se procesa
5. Revisa los productos extraídos
6. Edita si es necesario:
   - Nombres de productos
   - Códigos SKU
   - Categorías
   - Precios de costo y venta
7. Selecciona el proveedor
8. Completa método de pago y observaciones
9. Haz clic en **Guardar Compra**

### Paso 4: Verificar en Stock
1. Ve a **Stock e Inventario**
2. Verás todos los productos de la compra
3. Los códigos SKU están en la columna de códigos
4. El stock ya está actualizado

## 📋 Formato de PDF Soportado

El sistema está optimizado para PDFs con la siguiente estructura:

```
Orden #XXXX
Realizada el DD/MM/YYYY

Producto         Cantidad    Precio unitario    Total
---------------------------------------------------------
Nombre Producto    10 x       $ 1.234,56      $ 12.345,60
SKU: CODIGO123

Nombre Producto    5 x        $ 2.345,67      $ 11.728,35
SKU: CODIGO456
```

### Proveedores Soportados
- ✅ D&G Distribuidora
- ✅ Formato genérico de tablas

## 🔧 Personalización

### Agregar Soporte para Más Proveedores

Edita `src/services/pdfService.ts` en el método `extractProveedor()`:

```typescript
private static extractProveedor(text: string): string | undefined {
  const firstLines = text.split('\n').slice(0, 10).join('\n');
  
  if (firstLines.includes('TU PROVEEDOR')) return 'Tu Proveedor';
  // Agregar más patrones aquí
  
  return undefined;
}
```

### Ajustar Margen de Ganancia

En `src/app/(dashboard)/compras/form.tsx`, línea ~132:

```typescript
precio_venta: Math.round(p.precio_unitario * 1.5), // Cambiar 1.5 por tu margen
```

## 📊 Datos Almacenados

### Tabla `compras`
- proveedor_id
- usuario_id
- numero_orden (extraído del PDF)
- total
- metodo_pago
- estado (completada/pendiente/cancelada)
- observaciones
- **pdf_url** (enlace al PDF original)
- created_at, updated_at

### Tabla `compra_items`
- compra_id
- producto_id
- cantidad
- precio_unitario
- subtotal

### Tabla `productos` (actualizada/creada)
- codigo (código interno)
- **codigo_barra** (SKU del proveedor - para lector de código)
- nombre
- categoria
- precio_costo
- precio_venta
- stock_actual (actualizado con la compra)
- proveedor_id

## 🎯 Uso con Lector de Código de Barras

Una vez registrada la compra:

1. Los códigos SKU se guardan en el campo `codigo_barra`
2. En ventas, al escanear el código:
   - El sistema busca por `codigo` o `codigo_barra`
   - Encuentra el producto automáticamente
   - Carga precio y stock actual

## 🐛 Solución de Problemas

### El PDF no se procesa correctamente
- Verifica que sea un archivo PDF válido
- Revisa que tenga el formato esperado (tabla con productos)
- Intenta con otro PDF del mismo proveedor

### No se extraen los códigos SKU
- Verifica que el PDF tenga líneas con "SKU:"
- Edita manualmente los códigos en el formulario
- Los códigos SKU son opcionales

### Error al guardar la compra
- Verifica que hayas seleccionado un proveedor
- Asegúrate de tener al menos un producto
- Revisa la consola del navegador para más detalles

### Los productos no aparecen en stock
- Verifica que la compra tenga estado "completada"
- Actualiza la página de stock
- Revisa la tabla `productos` en Supabase

## 📝 Notas Técnicas

- **Extracción de PDF**: Usa `pdf-parse` para convertir PDF a texto
- **Almacenamiento**: PDFs guardados en Supabase Storage
- **Procesamiento**: Server-side en API route para mayor seguridad
- **Validación**: Verifica datos extraídos antes de guardar
- **Transacciones**: Usa transacciones para integridad de datos

## 🔄 Flujo Completo

```
1. Usuario carga PDF
   ↓
2. API extrae datos (productos, SKU, precios)
   ↓
3. Formulario muestra productos para revisión
   ↓
4. Usuario edita/confirma
   ↓
5. Sistema guarda compra
   ↓
6. Crea/actualiza productos en inventario
   ↓
7. Actualiza stock con cantidades
   ↓
8. Guarda PDF en storage
   ↓
9. Productos listos para venta con lector de código
```

## 🎉 Resultado Final

Ahora puedes:
- ✅ Cargar PDFs de proveedores
- ✅ Importar productos automáticamente
- ✅ Usar códigos SKU con lectores de código
- ✅ Actualizar stock automáticamente
- ✅ Ver historial de compras
- ✅ Vincular PDFs a cada compra
- ✅ Gestionar inventario eficientemente

---

**Desarrollado por**: Vaxler Software  
**Sistema**: Bazar M&M ERP  
**Fecha**: Noviembre 2025
