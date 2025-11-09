# 🎨 Configuración de Tickets - Guía de Uso

## 📍 Acceso a la Configuración

1. Inicia sesión en el sistema
2. Ve al menú lateral: **Configuración → Tickets**
3. Verás dos paneles:
   - **Izquierda**: Controles de configuración
   - **Derecha**: Vista previa en tiempo real

---

## ⚙️ Opciones de Configuración

### 🏢 Datos de la Empresa

Personaliza la información que aparece en el encabezado:

- **Nombre**: Nombre de tu negocio (ej: "BAZAR M&M")
- **Dirección**: Ubicación del local
- **Teléfono**: Número de contacto
- **CUIT**: Número de identificación fiscal

### 📐 Formato del Ticket

Controla el diseño general:

- **Ancho de línea**: 32-64 caracteres (ajusta según tu impresora)
  - 48 caracteres es ideal para impresoras térmicas de 80mm
  - 32 caracteres para impresoras de 58mm
  
- **Alineación del encabezado**:
  - `Izquierda`: Todo el encabezado alineado a la izquierda
  - `Centro`: Encabezado centrado (recomendado)
  - `Derecha`: Encabezado alineado a la derecha

- **Mostrar CUIT**: Activa/desactiva la visualización del CUIT

- **Separadores**: (automático)
  - Línea principal: `===` para secciones importantes
  - Línea secundaria: `---` para subsecciones

### 📦 Columnas de Productos

Ajusta el espacio de cada columna en la lista de productos:

- **Ancho columna nombre**: 15-30 caracteres
  - Más espacio = nombres completos, menos productos por línea
  - Menos espacio = nombres truncados, más compacto

- **Ancho columna cantidad**: 4-10 caracteres
  - Ajusta según la cantidad máxima que vendes

- **Ancho columna precio**: 8-15 caracteres
  - Ajusta según tus precios (ej: $999,999.99 necesita ~12 caracteres)

---

## 💾 Guardar Configuración

1. Ajusta todos los valores a tu gusto usando los controles
2. Observa la vista previa en tiempo real
3. Cuando estés satisfecho, haz clic en **"💾 Guardar Configuración"**

La configuración se guarda en:
- **LocalStorage del navegador**: Para uso inmediato
- **Servidor de impresión**: Para persistencia entre sesiones

---

## 🖨️ Aplicar la Configuración

Una vez guardada, la configuración se aplica automáticamente a:

- ✅ Todas las impresiones de tickets de ventas
- ✅ Tickets de prueba
- ✅ Futuros tickets

**No necesitas reiniciar nada**, los cambios son inmediatos.

---

## 📸 Ejemplo Basado en tu Impresora

Según la imagen que compartiste, tu configuración ideal sería:

```
📐 Formato:
- Ancho de línea: 48 caracteres
- Alineación: Centro
- Mostrar CUIT: Sí

📦 Productos:
- Ancho nombre: 22 caracteres
- Ancho cantidad: 5 caracteres
- Ancho precio: 12 caracteres

🏢 Empresa:
- Nombre: "BAZAR M&M"
- Dirección: "Calle Principal 123, Buenos Aires"
- Teléfono: "(011) 1234-5678"
- CUIT: "20-12345678-9"
```

---

## 🎯 Tips para Mejores Resultados

1. **Prueba primero**: Usa el botón de prueba de impresión antes de ventas reales
2. **Ancho de línea**: Si el texto sale cortado, reduce el ancho de línea
3. **Columnas de productos**: Asegúrate que: `anchoNombre + anchoCantidad + anchoPrecio ≤ anchoLinea`
4. **Texto truncado**: Si los nombres de productos se cortan, aumenta `anchoNombre`
5. **Vista previa**: Lo que ves en la vista previa es exactamente lo que se imprimirá

---

## 🔧 Solución de Problemas

### El ticket sale desalineado
- **Causa**: Ancho de línea muy grande para tu impresora
- **Solución**: Reduce el ancho de línea a 42 o 40 caracteres

### Los nombres de productos se cortan
- **Causa**: `anchoNombre` muy pequeño
- **Solución**: Aumenta `anchoNombre` a 25-28 caracteres

### Los precios no se ven bien
- **Causa**: `anchoPrecio` insuficiente
- **Solución**: Aumenta `anchoPrecio` a 14-15 caracteres

### Los cambios no se aplican
- **Causa**: Servidor de impresión no responde
- **Solución**: 
  1. Verifica que el servidor esté corriendo: `cd printer-server && npm start`
  2. Recarga la página de configuración
  3. Guarda nuevamente

---

## 📱 Acceso Rápido

Puedes acceder directamente a:

- **Configuración de tickets**: `http://localhost:3000/configuracion/ticket`
- **Prueba de impresión**: `http://localhost:3000/ventas` (botones de prueba)

---

## 🚀 Próximas Mejoras

Funcionalidades en desarrollo:

- [ ] Logo de la empresa en el encabezado
- [ ] Código QR personalizado
- [ ] Pie de página personalizable
- [ ] Múltiples plantillas de tickets
- [ ] Previsualización antes de cada impresión

---

¡Disfruta de tus tickets personalizados! 🎉
