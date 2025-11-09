# 🖨️ Guía Rápida de Impresión - Gadnic TP-450s

## ✅ Archivos Creados

```
bazar-mm/
├── printer-server/              # ← Servidor Node.js para la impresora
│   ├── server.js               # Servidor Express con ESC/POS
│   ├── package.json
│   └── README.md               # Documentación completa
│
├── src/
│   ├── lib/printer/
│   │   └── PrinterService.ts   # Cliente para comunicarse con el servidor
│   │
│   └── components/printer/
│       ├── BotonImprimirTicket.tsx       # Botón de imprimir
│       └── ConfiguracionImpresora.tsx    # Panel de configuración
│
└── .env                        # Variable NEXT_PUBLIC_PRINTER_SERVER_URL agregada
```

## 🚀 Pasos para Usar la Impresora

### 1. Conectar Hardware
- Conecta la **Gadnic TP-450s** por USB a tu computadora
- Enciende la impresora
- Verifica que Windows la detecte (Panel de Control → Dispositivos)

### 2. Iniciar Servidor de Impresión

Abre una **nueva terminal** (PowerShell) y ejecuta:

```powershell
cd printer-server
npm start
```

Deberías ver:
```
🖨️  Servidor de impresión corriendo en http://localhost:3001
📡 Endpoints disponibles:
   - GET  /health
   - GET  /impresora/status
   - POST /imprimir/ticket
   - POST /imprimir/test
```

### 3. Probar la Impresora

En otra terminal, prueba que funcione:

```powershell
# Verificar servidor
curl http://localhost:3001/health

# Verificar impresora
curl http://localhost:3001/impresora/status

# Imprimir ticket de prueba
curl -X POST http://localhost:3001/imprimir/test
```

Si todo está bien, la impresora imprimirá un ticket de prueba.

### 4. Integrar en tu Código

#### Opción A: Usar el componente directamente

```typescript
import { BotonImprimirTicket } from '@/components/printer/BotonImprimirTicket';

<BotonImprimirTicket
  venta={{
    venta: {
      id: ventaId,
      nro_ticket: '0001',
      created_at: new Date().toISOString(),
      total: 1500.00,
      subtotal: 1500.00,
      metodo_pago: 'efectivo',
      usuario_nombre: 'Cajero 1',
    },
    items: [
      {
        nombre: 'Producto A',
        cantidad: 2,
        precio_unitario: 500,
        subtotal: 1000
      }
    ],
    empresa: {
      nombre: 'BAZAR M&M',
      direccion: 'Tu dirección',
      telefono: '(011) 1234-5678',
      cuit: '20-12345678-9'
    }
  }}
  onSuccess={() => console.log('Impreso!')}
  onError={(error) => console.error(error)}
/>
```

#### Opción B: Usar el servicio directamente

```typescript
import { PrinterService } from '@/lib/printer/PrinterService';

const resultado = await PrinterService.imprimirTicket(ventaData);

if (resultado.success) {
  alert('✅ Ticket impreso correctamente');
} else {
  alert(`❌ Error: ${resultado.error}`);
}
```

### 5. Verificar en Configuración

Ve a `/dashboard/configuracion` y deberías ver el componente de configuración de impresora que muestra:
- Estado del servidor (conectado/desconectado)
- Estado de la impresora (detectada/no detectada)
- Botón para imprimir ticket de prueba

## 📋 Flujo Completo de Venta con Impresión

```typescript
// 1. Finalizar venta (guardar en Supabase)
const { data: venta, error } = await supabase
  .from('ventas')
  .insert({
    cliente_id: clienteId,
    usuario_id: usuarioId,
    total: totalVenta,
    subtotal: subtotalVenta,
    metodo_pago: 'efectivo',
    estado: 'completada'
  })
  .select()
  .single();

if (error) {
  alert('Error al guardar venta');
  return;
}

// 2. Preparar datos para impresión
const ventaParaImprimir = {
  venta: {
    id: venta.id,
    nro_ticket: venta.nro_ticket,
    created_at: venta.created_at,
    total: venta.total,
    subtotal: venta.subtotal,
    metodo_pago: venta.metodo_pago,
    usuario_nombre: nombreUsuario,
    cliente_nombre: nombreCliente,
  },
  items: itemsCarrito,
  empresa: datosEmpresa
};

// 3. Imprimir ticket
const resultado = await PrinterService.imprimirTicket(ventaParaImprimir);

if (resultado.success) {
  // Limpiar carrito y mostrar confirmación
  setCarrito([]);
  alert('✅ Venta completada y ticket impreso');
} else {
  // Venta guardada pero falló impresión
  alert(`⚠️ Venta guardada pero no se pudo imprimir: ${resultado.error}`);
}
```

## 🔧 Solución de Problemas

### ❌ "Servidor de impresión no disponible"

**Solución:** Inicia el servidor:
```powershell
cd printer-server
npm start
```

### ❌ "No se pudo conectar con la impresora"

**Soluciones:**
1. Verifica que la impresora esté encendida y conectada por USB
2. Instala los drivers de la Gadnic TP-450s
3. Reinicia el servidor de impresión
4. Verifica en "Dispositivos e impresoras" de Windows

### ❌ La impresora no imprime nada

**Soluciones:**
1. Verifica que tenga papel térmico de 80mm
2. Abre la tapa y ciérrala bien
3. Prueba con el botón físico de la impresora
4. Revisa la terminal del servidor por mensajes de error

### ❌ Imprime caracteres raros

**Solución:** La impresora usa ESC/POS estándar. Verifica que el charset esté configurado correctamente. Si persiste, contacta soporte.

## 💡 Tips y Mejoras

### Agregar Logo al Ticket

1. Convierte tu logo a formato blanco y negro (PNG, 200x200px máx)
2. Colócalo en `printer-server/assets/logo.png`
3. Modifica `server.js` para incluir la imagen:

```javascript
const escpos = require('escpos');
const path = require('path');

const image = await escpos.Image.load(path.join(__dirname, 'assets', 'logo.png'));

printer
  .align('ct')
  .image(image, 'd24')  // Densidad 24 puntos
  .text('BAZAR M&M')
  // ... resto del ticket
```

### Iniciar Automáticamente con Windows

Usa PM2 para que el servidor inicie automáticamente:

```powershell
npm install -g pm2-windows-startup pm2
pm2-startup install
cd printer-server
pm2 start server.js --name "bazar-printer"
pm2 save
```

### Imprimir Código QR en el Ticket

```javascript
// En server.js
printer
  .qrimage('https://bazarmym.com/ticket/ABC123', {
    type: 'png',
    mode: 'dhdw'
  })
  .then(() => {
    printer.cut().close();
  });
```

## 📞 Soporte

Si tienes problemas:
1. Revisa el archivo `printer-server/README.md` (documentación completa)
2. Verifica los logs de la terminal donde corre el servidor
3. Prueba el endpoint `/imprimir/test` para descartar problemas de hardware

---

## ✅ Checklist de Verificación

- [ ] Impresora conectada y encendida
- [ ] Drivers instalados
- [ ] Dependencias instaladas (`cd printer-server && npm install`)
- [ ] Servidor corriendo (`npm start`)
- [ ] Ticket de prueba impreso (`curl -X POST http://localhost:3001/imprimir/test`)
- [ ] Variable de entorno configurada (`NEXT_PUBLIC_PRINTER_SERVER_URL`)
- [ ] Componente integrado en página de ventas

---

**¡Listo para imprimir!** 🎉

Si todo está configurado correctamente, cada vez que finalices una venta podrás imprimir el ticket automáticamente con todos los detalles.
