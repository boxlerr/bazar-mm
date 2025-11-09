# 🎉 ¡Prueba de Impresión Lista!

## ✅ Lo que se ha implementado:

He agregado un **componente de prueba** en la página de Ventas que te permite probar la impresora con un solo clic.

## 📍 Dónde encontrarlo:

1. Abre tu navegador y ve a: `http://localhost:3000/ventas`
2. Verás una tarjeta morada/azul en la parte superior con dos botones:
   - **🧪 Ticket Simple**: Imprime un ticket de prueba básico
   - **🎫 Ticket Completo**: Imprime un ticket de venta completo con productos de ejemplo

## 🚀 Cómo usar:

### Paso 1: Asegúrate de que el servidor de impresión esté corriendo

En una terminal (debe estar abierta mientras uses el sistema):

```powershell
cd printer-server
npm start
```

Deberías ver:
```
🖨️  Servidor de impresión corriendo en http://localhost:3001
```

### Paso 2: Ve a la página de Ventas

```
http://localhost:3000/ventas
```

### Paso 3: Prueba la impresión

- Haz clic en **"🧪 Ticket Simple"** para una prueba rápida
- Haz clic en **"🎫 Ticket Completo"** para ver un ticket de venta completo

La impresora debería imprimir el ticket automáticamente.

## 📋 Qué imprime el Ticket Completo:

```
        BAZAR M&M
Calle Principal 123, Buenos Aires
    Tel: (011) 1234-5678
    CUIT: 20-12345678-9
--------------------------------
Ticket Nro: 0001
Fecha: 09/11/2025 19:30:15
Cajero: Sistema
================================
PRODUCTO          CANT   PRECIO
================================
Producto A           2  $1600.00
Producto B           3   $900.00
================================
         Subtotal: $2500.00
            TOTAL: $2500.00
--------------------------------
      Método: EFECTIVO
--------------------------------
 Cliente: Cliente de Prueba
================================
   Gracias por su compra!
    www.bazarmym.com
```

## 🎯 Próximos Pasos:

Ahora que la impresión funciona, puedes:

1. **Integrar en el flujo real de ventas**: Cuando termines una venta real, usar el mismo código para imprimir
2. **Personalizar el ticket**: Editar `printer-server/server.js` para cambiar el formato
3. **Agregar tu logo**: Seguir las instrucciones en `printer-server/README.md`

## 🔧 Si algo no funciona:

### ❌ "Servidor de impresión no disponible"
**Solución:** Abre una terminal y ejecuta:
```powershell
cd printer-server
npm start
```

### ❌ "No se pudo conectar con el servidor"
**Solución:** Verifica que ambos servidores estén corriendo:
- Next.js en `http://localhost:3000`
- Servidor de impresión en `http://localhost:3001`

### ❌ La impresora no imprime nada
**Solución:**
1. Verifica que la impresora esté encendida y conectada por USB
2. Revisa que tenga papel térmico
3. Mira la terminal del servidor de impresión por errores

## 💡 Tip para Desarrollo:

Mantén **2 terminales abiertas** siempre:

**Terminal 1 - Next.js:**
```powershell
npm run dev
```

**Terminal 2 - Servidor de Impresión:**
```powershell
cd printer-server
npm start
```

---

¡Listo para imprimir! 🎊
