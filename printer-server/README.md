# 🖨️ Servidor de Impresión - Gadnic TP-450s

Servidor Node.js local para manejar la impresión de tickets en la impresora térmica Gadnic TP-450s.

## 📋 Requisitos Previos

1. **Impresora conectada**: Gadnic TP-450s conectada por USB
2. **Drivers instalados**: Asegúrate de tener los drivers de la impresora instalados
3. **Node.js**: Versión 16 o superior

## 🚀 Instalación

### Paso 1: Navegar a la carpeta del servidor

```powershell
cd printer-server
```

### Paso 2: Instalar dependencias

```powershell
npm install
```

### Paso 3: Verificar conexión de la impresora

En Windows, ve a:
- **Panel de Control** → **Dispositivos e impresoras**
- Verifica que la Gadnic TP-450s aparezca como dispositivo USB

## ▶️ Uso

### Iniciar el servidor

```powershell
npm start
```

El servidor iniciará en `http://localhost:3001`

### Modo desarrollo (con reinicio automático)

```powershell
npm run dev
```

## 🧪 Probar la Impresora

### 1. Verificar que el servidor esté corriendo

```powershell
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "Servidor de impresión activo",
  "timestamp": "2025-11-09T..."
}
```

### 2. Verificar estado de la impresora

```powershell
curl http://localhost:3001/impresora/status
```

### 3. Imprimir ticket de prueba

```powershell
curl -X POST http://localhost:3001/imprimir/test
```

## 📡 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Verificar estado del servidor |
| GET | `/impresora/status` | Verificar conexión de impresora |
| POST | `/imprimir/ticket` | Imprimir ticket de venta |
| POST | `/imprimir/test` | Imprimir ticket de prueba |

## 📤 Ejemplo de Uso desde Next.js

```typescript
import { PrinterService } from '@/lib/printer/PrinterService';

// Imprimir ticket después de completar venta
const resultado = await PrinterService.imprimirTicket({
  venta: {
    id: 'abc123',
    nro_ticket: '0001',
    created_at: new Date().toISOString(),
    total: 1500.00,
    subtotal: 1500.00,
    metodo_pago: 'efectivo',
    usuario_nombre: 'Juan Pérez',
  },
  items: [
    {
      nombre: 'Producto A',
      cantidad: 2,
      precio_unitario: 500,
      subtotal: 1000
    },
    {
      nombre: 'Producto B',
      cantidad: 1,
      precio_unitario: 500,
      subtotal: 500
    }
  ],
  empresa: {
    nombre: 'BAZAR M&M',
    direccion: 'Calle Falsa 123',
    telefono: '(011) 1234-5678',
    cuit: '20-12345678-9'
  }
});

if (resultado.success) {
  console.log('✅ Ticket impreso');
} else {
  console.error('❌ Error:', resultado.error);
}
```

## 🛠️ Solución de Problemas

### Error: "No se pudo conectar con la impresora"

**Causas posibles:**
1. La impresora no está conectada por USB
2. Los drivers no están instalados
3. La impresora está apagada
4. Windows no reconoce el dispositivo

**Solución:**
```powershell
# Verificar dispositivos USB en PowerShell
Get-PnpDevice -PresentOnly | Where-Object { $_.InstanceId -match '^USB' }
```

### Error: "Servidor de impresión no disponible"

**Causa:** El servidor Node.js no está corriendo.

**Solución:**
```powershell
cd printer-server
npm start
```

### La impresora imprime caracteres raros

**Causa:** Configuración incorrecta de codificación.

**Solución:** La impresora Gadnic TP-450s usa ESC/POS estándar. Asegúrate de que esté configurada para usar el charset correcto.

## 🔧 Configuración Avanzada

### Cambiar el puerto del servidor

Edita `server.js`:

```javascript
const PORT = 3002; // Cambiar de 3001 a 3002
```

Y actualiza el `.env` en Next.js:

```env
NEXT_PUBLIC_PRINTER_SERVER_URL="http://localhost:3002"
```

### Agregar logo en el ticket

Para agregar un logo, necesitas convertir la imagen a formato ESC/POS:

```javascript
const escpos = require('escpos');
const path = require('path');

// Cargar imagen
const image = await escpos.Image.load(path.join(__dirname, 'logo.png'));

printer
  .align('ct')
  .image(image, 'd24')
  .text('BAZAR M&M')
  // ... resto del ticket
```

## 📝 Notas Importantes

- ⚠️ El servidor debe estar corriendo mientras uses el sistema POS
- 💡 Se recomienda configurarlo para iniciar automáticamente con Windows
- 🔒 El servidor solo escucha en `localhost` por seguridad
- 📦 La impresora Gadnic TP-450s soporta papel de 80mm

## 🚀 Iniciar Automáticamente con Windows

### Opción 1: Task Scheduler

1. Abre el **Programador de tareas** de Windows
2. Crea una tarea nueva
3. Trigger: Al iniciar sesión
4. Acción: Ejecutar script
5. Programa: `node`
6. Argumentos: `C:\ruta\a\printer-server\server.js`

### Opción 2: PM2

```powershell
npm install -g pm2
pm2 start server.js --name printer-server
pm2 startup
pm2 save
```

## 📞 Soporte

Para problemas o consultas, contacta al equipo de desarrollo de Vaxler Software.

---

**Versión:** 1.0.0  
**Fecha:** Noviembre 2025  
**Autor:** Vaxler Software
