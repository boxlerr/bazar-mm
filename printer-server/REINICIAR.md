# 🔄 REINICIAR SERVIDOR DE IMPRESIÓN

El código ha sido actualizado para:
1. ✅ Usar PowerShell moderno (compatible con Windows 11)
2. ✅ Buscar específicamente tu impresora **IMPTER13**
3. ✅ Eliminar dependencia de `wmic` (deprecado)

## 📋 Pasos para reiniciar:

### 1. Detener el servidor actual
En la terminal donde está corriendo el servidor, presiona:
```
Ctrl + C
```

### 2. Iniciar el servidor nuevamente
```powershell
cd printer-server
npm start
```

### 3. Probar desde el navegador
Ve a: `http://localhost:3000/ventas`

Haz clic en **"🧪 Ticket Simple"** o **"🎫 Ticket Completo"**

---

## 🖨️ Tu impresora detectada:

El servidor ahora buscará específicamente:
- ✅ **IMPTER13** (tu modelo)
- Gadnic (por si acaso)
- POS
- Thermal

Si el servidor detecta tu IMPTER13, la usará automáticamente.

---

## ⚡ ¿Necesitas ayuda?

Si después de reiniciar aún hay problemas, ejecuta esto para verificar que Windows detecta tu impresora:

```powershell
Get-Printer | Select-Object Name, PrinterStatus
```

Deberías ver **IMPTER13** en la lista.
