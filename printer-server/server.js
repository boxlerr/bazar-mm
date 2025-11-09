const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración por defecto del ticket
let ticketConfig = {
  empresa: {
    nombre: 'BAZAR M&M',
    direccion: 'Calle Principal 123, Buenos Aires',
    telefono: '(011) 1234-5678',
    cuit: '20-12345678-9'
  },
  formato: {
    anchoLinea: 48,
    alinearEncabezado: 'centro',
    mostrarCuit: true,
    separadorPrincipal: '=',
    separadorSecundario: '-'
  },
  productos: {
    anchoNombre: 20,
    anchoCantidad: 6,
    anchoPrecio: 12,
    mostrarPrecioUnitario: false
  }
};

// Función para obtener impresoras disponibles
function obtenerImpresoras() {
  return new Promise((resolve, reject) => {
    // Usar PowerShell para obtener impresoras (compatible con Windows 11)
    const command = 'powershell -Command "Get-Printer | Select-Object -ExpandProperty Name"';
    
    exec(command, (error, stdout) => {
      if (error) {
        console.error('Error al obtener impresoras:', error);
        reject(error);
        return;
      }
      
      const lines = stdout.split('\n')
        .map(l => l.trim())
        .filter(l => l && l.length > 0);
      
      console.log('Impresoras detectadas:', lines);
      resolve(lines);
    });
  });
}

// Función para imprimir ticket
async function imprimirTicket(ventaData) {
  return new Promise(async (resolve, reject) => {
    try {
      // Obtener impresoras
      const impresoras = await obtenerImpresoras();
      
      // Buscar impresora IMPTER13, Gadnic o térmica
      let printerName = impresoras.find(p => 
        p.toLowerCase().includes('impter') || 
        p.toLowerCase().includes('impter13') ||
        p.toLowerCase().includes('gadnic') || 
        p.toLowerCase().includes('pos') ||
        p.toLowerCase().includes('thermal')
      ) || impresoras[0];
      
      if (!printerName) {
        reject(new Error('No se encontró ninguna impresora'));
        return;
      }

      const { venta, items, empresa } = ventaData;
      
      // Usar configuración del ticket
      const config = ticketConfig;
      const empresaData = empresa || config.empresa;
      
      // Generar contenido del ticket en formato de texto
      let ticketContent = '';
      
      // Encabezado con alineación configurable
      ticketContent += '\n\n';
      
      const formatearEncabezado = (texto) => {
        switch (config.formato.alinearEncabezado) {
          case 'centro': return centrarTexto(texto);
          case 'derecha': return alinearDerecha(texto);
          default: return alinearIzquierda(texto);
        }
      };
      
      ticketContent += formatearEncabezado(empresaData.nombre) + '\n';
      ticketContent += formatearEncabezado(empresaData.direccion) + '\n';
      ticketContent += formatearEncabezado(empresaData.telefono) + '\n';
      
      if (config.formato.mostrarCuit && empresaData.cuit) {
        ticketContent += formatearEncabezado(`CUIT: ${empresaData.cuit}`) + '\n';
      }
      
      ticketContent += linea(config.formato.separadorSecundario) + '\n';
      
      // Información de la venta
      ticketContent += `Ticket: ${venta.nro_ticket || venta.id.substring(0, 8).toUpperCase()}\n`;
      ticketContent += `Fecha: ${new Date(venta.created_at).toLocaleString('es-AR')}\n`;
      ticketContent += `Cajero: ${venta.usuario_nombre || 'Sistema'}\n`;
      ticketContent += linea() + '\n';
      
      // Encabezado de productos con anchos configurables
      const headerProducto = 'PRODUCTO'.padEnd(config.productos.anchoNombre);
      const headerCant = 'CANT'.padStart(config.productos.anchoCantidad);
      const headerPrecio = 'PRECIO'.padStart(config.productos.anchoPrecio);
      ticketContent += headerProducto + headerCant + headerPrecio + '\n';
      ticketContent += linea() + '\n';
      
      // Items con formato configurable
      items.forEach(item => {
        const nombre = item.nombre.substring(0, config.productos.anchoNombre).padEnd(config.productos.anchoNombre);
        const cantidad = String(item.cantidad).padStart(config.productos.anchoCantidad);
        const precio = `$${item.subtotal.toFixed(2)}`.padStart(config.productos.anchoPrecio);
        ticketContent += nombre + cantidad + precio + '\n';
      });
      
      ticketContent += linea() + '\n';
      ticketContent += alinearDerecha(`Subtotal: $${venta.subtotal.toFixed(2)}`) + '\n';
      
      // Descuento
      if (venta.descuento && venta.descuento > 0) {
        ticketContent += alinearDerecha(`Descuento: -$${venta.descuento.toFixed(2)}`) + '\n';
      }
      
      ticketContent += '\n';
      ticketContent += alinearDerecha(`TOTAL: $${venta.total.toFixed(2)}`) + '\n';
      ticketContent += linea(config.formato.separadorSecundario) + '\n';
      ticketContent += centrarTexto(`Metodo: ${venta.metodo_pago.toUpperCase()}`) + '\n';
      
      // Cliente
      if (venta.cliente_nombre) {
        ticketContent += linea(config.formato.separadorSecundario) + '\n';
        ticketContent += centrarTexto(`Cliente: ${venta.cliente_nombre}`) + '\n';
      }
      
      ticketContent += linea() + '\n';
      ticketContent += centrarTexto('Gracias por su compra!') + '\n';
      ticketContent += centrarTexto('www.bazarmym.com') + '\n';
      ticketContent += '\n\n\n';
      
      // Crear archivo temporal
      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, `ticket_${Date.now()}.txt`);
      
      // Guardar contenido en archivo
      fs.writeFileSync(tempFile, ticketContent, 'utf8');
      
      // Imprimir usando comando de Windows
      const printCommand = `powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name '${printerName}'"`;
      
      exec(printCommand, (error, stdout, stderr) => {
        // Eliminar archivo temporal
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignorar errores al eliminar
        }
        
        if (error) {
          console.error('Error al imprimir:', error);
          reject(new Error('Error al enviar a la impresora: ' + error.message));
          return;
        }
        
        console.log('Ticket impreso correctamente en:', printerName);
        resolve({ success: true, message: 'Ticket impreso correctamente' });
      });
      
    } catch (error) {
      console.error('Error en impresión:', error);
      reject(error);
    }
  });
}

// Funciones auxiliares para formatear texto
function centrarTexto(texto, ancho = null) {
  const anchoReal = ancho || ticketConfig.formato.anchoLinea;
  const espacios = Math.max(0, Math.floor((anchoReal - texto.length) / 2));
  return ' '.repeat(espacios) + texto;
}

function alinearDerecha(texto, ancho = null) {
  const anchoReal = ancho || ticketConfig.formato.anchoLinea;
  const espacios = Math.max(0, anchoReal - texto.length);
  return ' '.repeat(espacios) + texto;
}

function alinearIzquierda(texto) {
  return texto;
}

function linea(caracter = null) {
  const char = caracter || ticketConfig.formato.separadorPrincipal;
  return char.repeat(ticketConfig.formato.anchoLinea);
}

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor de impresión activo',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para obtener configuración
app.get('/configuracion/ticket', (req, res) => {
  res.json(ticketConfig);
});

// Endpoint para guardar configuración
app.post('/configuracion/ticket', (req, res) => {
  try {
    const nuevaConfig = req.body;
    
    // Validar que tenga la estructura correcta
    if (nuevaConfig.empresa && nuevaConfig.formato && nuevaConfig.productos) {
      ticketConfig = nuevaConfig;
      
      // Opcionalmente, guardar en archivo para persistencia
      const configPath = path.join(__dirname, 'ticket-config.json');
      fs.writeFileSync(configPath, JSON.stringify(ticketConfig, null, 2));
      
      res.json({ 
        success: true, 
        message: 'Configuración actualizada correctamente',
        config: ticketConfig 
      });
    } else {
      res.status(400).json({ 
        error: 'Formato de configuración inválido' 
      });
    }
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    res.status(500).json({ 
      error: 'Error al guardar configuración',
      details: error.message 
    });
  }
});

// Cargar configuración al iniciar (si existe)
const configPath = path.join(__dirname, 'ticket-config.json');
if (fs.existsSync(configPath)) {
  try {
    const configGuardada = fs.readFileSync(configPath, 'utf8');
    ticketConfig = JSON.parse(configGuardada);
    console.log('✅ Configuración de ticket cargada desde archivo');
  } catch (error) {
    console.log('⚠️  Usando configuración por defecto');
  }
}

// Endpoint para imprimir ticket
app.post('/imprimir/ticket', async (req, res) => {
  try {
    const ventaData = req.body;
    
    if (!ventaData || !ventaData.venta || !ventaData.items) {
      return res.status(400).json({ 
        error: 'Datos de venta incompletos' 
      });
    }

    const resultado = await imprimirTicket(ventaData);
    res.json(resultado);
    
  } catch (error) {
    console.error('Error al imprimir:', error);
    res.status(500).json({ 
      error: error.message || 'Error al imprimir ticket',
      details: error.toString()
    });
  }
});

// Endpoint para verificar conexión de impresora
app.get('/impresora/status', async (req, res) => {
  try {
    const impresoras = await obtenerImpresoras();
    
    if (impresoras && impresoras.length > 0) {
      res.json({
        connected: true,
        devices: impresoras.length,
        info: 'Impresora detectada',
        printers: impresoras
      });
    } else {
      res.json({
        connected: false,
        message: 'No se detectó ninguna impresora'
      });
    }
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

// Endpoint de prueba
app.post('/imprimir/test', async (req, res) => {
  try {
    const impresoras = await obtenerImpresoras();
    
    let printerName = impresoras.find(p => 
      p.toLowerCase().includes('impter') || 
      p.toLowerCase().includes('impter13') ||
      p.toLowerCase().includes('gadnic') || 
      p.toLowerCase().includes('pos') ||
      p.toLowerCase().includes('thermal')
    ) || impresoras[0];
    
    if (!printerName) {
      return res.status(500).json({ error: 'No se encontró ninguna impresora' });
    }
    
    // Generar ticket de prueba
    let ticketPrueba = '\n\n';
    ticketPrueba += centrarTexto('===============================================', 48) + '\n';
    ticketPrueba += centrarTexto('PRUEBA DE IMPRESION', 48) + '\n';
    ticketPrueba += centrarTexto('===============================================', 48) + '\n';
    ticketPrueba += '\n';
    ticketPrueba += centrarTexto('Impresora Gadnic TP-450s', 48) + '\n';
    ticketPrueba += centrarTexto('Sistema Bazar M&M', 48) + '\n';
    ticketPrueba += '\n';
    ticketPrueba += centrarTexto('-----------------------------------------------', 48) + '\n';
    ticketPrueba += centrarTexto(new Date().toLocaleString('es-AR'), 48) + '\n';
    ticketPrueba += centrarTexto('-----------------------------------------------', 48) + '\n';
    ticketPrueba += '\n';
    ticketPrueba += centrarTexto('Impresora funcionando correctamente', 48) + '\n';
    ticketPrueba += '\n';
    ticketPrueba += centrarTexto('Impresora: ' + printerName, 48) + '\n';
    ticketPrueba += '\n\n\n\n';
    
    // Crear archivo temporal
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `test_ticket_${Date.now()}.txt`);
    
    fs.writeFileSync(tempFile, ticketPrueba, 'utf8');
    
    const printCommand = `powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name '${printerName}'"`;
    
    exec(printCommand, (error, stdout, stderr) => {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignorar
      }
      
      if (error) {
        res.status(500).json({ error: 'Error al imprimir: ' + error.message });
        return;
      }
      
      res.json({ 
        success: true, 
        message: 'Ticket de prueba impreso',
        printer: printerName 
      });
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🖨️  Servidor de impresión corriendo en http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /impresora/status`);
  console.log(`   - POST /imprimir/ticket`);
  console.log(`   - POST /imprimir/test`);
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});
