# Mapa del Sitio y Flujos - Bazar M&M

Este documento detalla la estructura completa del sistema (Sitemap), todas las funcionalidades por módulo y los flujos detallados que un usuario puede realizar dentro de la aplicación **Bazar M&M**.

---

## 🗺️ 1. Sitemap (Estructura de Menús y Navegación)

El sistema cuenta con un menú lateral (Sidebar) responsivo que adapta sus opciones según el `Rol` del usuario autenticado (Admin, Vendedor, Cajero) y sus permisos específicos:

- **Dashboard Principal** (`/`)
- **Ventas** (`/ventas`)
- **Compras** (`/compras`)
- **Proveedores** (`/proveedores`)
- **Stock** (`/stock`)
- **Clientes** (`/clientes`)
- **Caja** (`/caja`)
- **Presupuestos** (`/presupuestos`)
- **Reportes** (`/reportes`) - _(Solo con permisos)_
- **Usuarios** (`/usuarios`) - _(Solo con permisos)_
- **Configuración** (`/configuracion`) - _(Menú Desplegable - Solo con permisos)_
  - General (`/configuracion`)
  - Negocio (`/configuracion/empresa`)
  - Plantillas PDF (`/configuracion/pdf-templates`)
  - Notificaciones (`/configuracion/notificaciones`)

---

## ⚙️ 2. Módulos y Funcionalidades Principales

A continuación se detalla cada módulo con sus respectivas características y pantallas:

### 📈 Ventas (Punto de Venta / POS)
Es el módulo central para cajeros y vendedores.
- **Buscador de Productos:** Búsqueda rápida de productos para agregar al carrito de compras.
- **Carrito (CartSummary):** Resumen de los ítems seleccionados, cantidades, cálculo de subtotales, descuentos e impuestos.
- **Selección de Cliente (ClientSelectionModal):** Permite vincular la venta a un cliente específico (para cuentas corrientes o registro histórico).
- **Proceso de Pago (PaymentModal):** Acepta y registra múltiples métodos de pago (Efectivo, Tarjeta, Transferencia, etc.) y calcula el vuelto/cambio.
- **Historial de Ventas:** Visualización (`SalesHistoryTable`) de todas las ventas emitidas.

### 🛒 Compras
Gestión de abastecimiento.
- **Listado de Compras:** Visualización de todas las compras realizadas e ingresos de mercadería.
- **Nueva Compra (`/compras/nueva`):** Flujo para registrar la compra a un proveedor agregando productos a ingresar al stock.
- **Detalle de Compra (`/compras/[id]`):** Vista profunda con el desglose de productos comprados, montos y facturas asociadas.

### 🚚 Proveedores
Gestión de la tabla del directorio de proveedores.
- **Listado de Proveedores:** Información de contacto, CUIT/RUT y condiciones comerciales.
- **ABM (Alta, Baja y Modificación):** Creación de nuevos proveedores, edición de datos y eliminación.

### 📦 Stock (Inventario)
Control del almacén y precios.
- **Listado de Productos (`table.tsx`):** Grilla principal para ver niveles de inventario, costos y precios de venta.
- **Nuevo Producto (`/stock/nuevo`):** Formulario para registrar un artículo, asignar categoría, códigos de barras (SKU) y alertas de stock mínimo.
- **Edición de Producto (`/stock/[id]`):** Modificación de precios e información del artículo.
- **Ajustes de Stock (`/stock/ajustes`):** Flujo para registrar mermas, pérdidas, ingresos manuales o correcciones de inventario con motivo justificado.

### 👥 Clientes
CRM Básico y Cuentas Corrientes.
- **Cartera de Clientes (`ClientsList.tsx`):** Listado y buscador de clientes.
- **Ficha Detallada del Cliente (`ClienteDetalleView.tsx`):** Historial completo del cliente (Excel-like sheet).
- **Cuentas Corrientes y Movimientos (`MovimientosTable.tsx`):** Registro de deuda, entregas a cuenta y saldos.
- **Cobranzas (`PaymentModal.tsx`):** Ventana para registrar el pago de saldos pendientes de un cliente.

### 💵 Caja (Tesorería)
Control del flujo de dinero físico y digital.
- **Acciones de Caja (`CajaActions.tsx`):** Apertura y Cierre de caja.
- **Estadísticas (`CajaStats.tsx`):** Resumen en tiempo real del dinero esperado, ingresos y egresos del turno.
- **Movimientos de Caja (`MovimientosList.tsx`):** Listado de cada operación que afectó la caja (ventas, pagos, retiros, etc.).
- **Retiros/Ingresos manuales (`CajaModal.tsx`):** Extracciones para pagos menores o ingresos extra no provenientes de ventas.
- **Arqueo de Caja (`arqueo.tsx`):** Pantalla de conciliación de fin de turno/día para calcular diferencias (sobrantes/faltantes).

### 📝 Presupuestos
Emisión de cotizaciones.
- **Listado de Presupuestos:** Registro de cotizaciones emitidas.
- **Creación/Edición (`BudgetForm.tsx`):** Formato similar al punto de venta pero sin afectar stock ni caja; guarda una cotización con validez limitada.
- **Visualización y Exportación (`BudgetDetailModal.tsx` / `BudgetPDF.tsx`):** Conversión del presupuesto a PDF para enviar al cliente.

### 📊 Reportes
Inteligencia de negocio y métricas.
- **Dashboards y Gráficos:** Ingresos, productos más vendidos, y rentabilidad.
- **Exportación de Datos (`export.ts`):** Descarga de reportes en formatos Excel/CSV o PDF para contabilidad.

### 🧑‍💻 Usuarios
Gestión de personal y accesos.
- **Listado de Personal:** Tabla de empleados con acceso al sistema.
- **Gestión de Roles (`form.tsx`):** Asignación de rol (Admin, Cajero, Vendedor) que define qué menús pueden ver.
- **Ficha de Usuario (`detalle.tsx`):** Historial de actividad o datos del empleado.

### ⚙️ Configuración
Personalización profunda del sistema.
- **Datos de la Empresa (`/empresa`):** Nombre, Logo, Dirección, CUIT, usados en facturas y reportes.
- **Plantillas PDF (`/pdf-templates`):** Editor para diseñar el formato de los recibos, presupuestos y comprobantes que se imprimen o exportan.
- **Notificaciones (`/notificaciones`):** Configuración de alertas (ej. alertas de stock bajo).
- **Prueba de Impresión (`/prueba-impresion`):** Herramientas para conectar y calibrar tickeadoras térmicas.

---

## 🔄 3. Mapa Detallado de Flujos (User Journeys)

A continuación se exponen los caminos paso a paso de las acciones más importantes del sistema:

### Flujo A: Realizar una Venta (Mostrador)
1. El Vendedor ingresa a **`/ventas`**.
2. **Búsqueda:** Escanea un código de barras o busca el producto por nombre en el buscador.
3. **Selección:** Ajusta la cantidad del producto en el carrito (CartSummary). Si corresponde, aplica un descuento manual.
4. **Asignación (Opcional):** Hace clic en "Seleccionar Cliente" y busca al comprador (útil si la venta será a Cuenta Corriente).
5. **Cobro:** Presiona "Cobrar". Se despliega el `PaymentModal`.
6. **Método de Pago:** Selecciona si es Efectivo, Tarjeta o Cuenta Corriente. Ingresa el monto recibido (el sistema calcula el vuelto).
7. **Cierre:** Confirma la venta. El sistema descuenta el stock de los productos vendidos, asienta el ingreso en **Caja**, y opcionalmente imprime el ticket PDF/Térmico.

### Flujo B: Ingreso de Mercadería (Compras)
1. El Administrador ingresa a **`/compras/nueva`**.
2. **Datos Iniciales:** Selecciona al **Proveedor** (buscándolo de la lista), e ingresa el Número de Factura/Remito del proveedor.
3. **Carga de Artículos:** Busca los productos que llegaron y especifica la cantidad entrante y el costo unitario actualizado.
4. **Confirmación:** Guarda la compra.
5. **Impacto:** El sistema suma las cantidades al inventario (`/stock`), actualiza el costo de referencia y asienta la cuenta por pagar o el egreso de dinero.

### Flujo C: Apertura, Operación y Cierre de Caja
1. **Apertura:** Al iniciar el día o turno, el Cajero ingresa a **`/caja`** y declara el "Monto Inicial" (Fondo de caja/cambio).
2. **Turno de Trabajo:** Durante el día, todas las Ventas en efectivo o tarjeta suman automáticamente al total del sistema.
3. **Retiros Operativos:** Si se saca plata de la caja registradora (ej. para comprar artículos de limpieza), el cajero entra a "Retiro/Egreso" (`CajaModal.tsx`), escribe el motivo y el monto, y confirma.
4. **Arqueo (Cierre):** Al terminar el turno, el cajero entra a "Arqueo de Caja".
5. **Conteos:** Cuenta cuanta plata física hay y tarjetas, e ingresa esos números al sistema.
6. **Conciliación:** El sistema compara lo "Contado" vs lo "Esperado en Sistema" y emite el "Sobrante" o "Faltante". La caja queda cerrada.

### Flujo D: Ajuste Manual de Inventario (Mermas o Correcciones)
1. Ante un producto roto o robado, el Admin va a **`/stock/ajustes`**.
2. Clic en "Nuevo Ajuste".
3. Selecciona el ítem afectado buscar por SKU o nombre.
4. Ingresa la configuración del ajuste: "Tipo: Salida/Merma", "Cantidad: -1", "Motivo: Producto dañado en estantería".
5. Confirma. El sistema descuenta 1 unidad del inventario real, dejando trazabilidad en el historial para auditorías.

### Flujo E: Pago de Cuenta Corriente (Cobranzas)
1. Un cliente viene a pagar una deuda. El Vendedor va a **`/clientes`**.
2. Busca al cliente en la grilla y entra a su "Ficha Detallada" (`ClienteDetalleView.tsx`).
3. Va a la solapa de **Movimientos** o "Deuda" y visualiza el saldo total en rojo.
4. Hace clic en "Registrar Pago".
5. En el modal (`PaymentModal.tsx` versión clientes), ingresa el dinero entregado por el cliente y el método de pago utilizado.
6. Confirma. El sistema añade un egreso del saldo deudor del cliente, y asienta un "Ingreso de Dinero" en el módulo de **Caja**.

### Flujo F: Generar y Enviar un Presupuesto
1. Un cliente solicita precio por cantidad. El Vendedor entra a **`/presupuestos/nuevo`**.
2. Busca los productos requeridos, fija los precios (sin afectar stock).
3. Selecciona los datos del cliente.
4. Escribe un comentario (ej. "Validez por 5 días").
5. Guarda el presupuesto.
6. Se abre la pantalla de previsualización (`BudgetPDF.tsx`), desde la cual se puede "Descargar PDF" o enviarlo directamente para impresión térmica/A4 a través de la plantilla configurada en **`/configuracion/pdf-templates`**.

---

_Este documento cubre la arquitectura a nivel Frontend/Backend de las acciones disponibles, rutas base y flujos lógicos extraídos directamente del código fuente de Bazar M&M._
