const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer");
const { execFile } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Nombre EXACTO de la impresora
const PRINTER_NAME = "POS-80C";

// Ruta PDF temporal
const TEMP_PDF = path.join(os.tmpdir(), "ticket_bazar_mm.pdf");

// Ruta de SumatraPDF
// Intentamos usar la ruta proporcionada por el usuario o la local
const SUMATRA_PATH = "C:\\Users\\boxle\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe";

// Variable global para la instancia del navegador
let browserInstance = null;

// Función para obtener/iniciar el navegador
async function getBrowser() {
  if (!browserInstance) {
    console.log("🚀 Iniciando navegador Puppeteer...");
    try {
      browserInstance = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox"],
      });

      // Manejar desconexión del navegador
      browserInstance.on('disconnected', () => {
        console.log("⚠️ Navegador desconectado. Se reiniciará en la próxima solicitud.");
        browserInstance = null;
      });
      console.log("✅ Navegador Puppeteer LISTO para imprimir");
    } catch (error) {
      console.error("❌ Error iniciando Puppeteer:", error);
      browserInstance = null;
    }
  }
  return browserInstance;
}

// Generar ticket PDF 80mm
async function generarPDF(html) {
  let page = null;
  try {
    const browser = await getBrowser();
    if (!browser) throw new Error("No se pudo iniciar el navegador");

    page = await browser.newPage();

    // Optimizamos waitUntil a 'load' ya que no cargamos recursos externos pesados
    await page.setContent(html, { waitUntil: "load" });

    await page.pdf({
      path: TEMP_PDF,
      width: "80mm",
      printBackground: true,
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    // Si falla algo crítico, intentamos cerrar la página o el browser
    if (browserInstance) {
      // En caso de error grave dejamos que se cierre o reinicie
    }
    throw error;
  } finally {
    if (page) await page.close().catch(() => { });
  }
}

// Imprimir usando SumatraPDF
function imprimirPDF() {
  return new Promise((resolve, reject) => {
    // Usamos execFile que es más seguro y maneja mejor las comillas en rutas
    const args = [
      '-print-to', PRINTER_NAME,
      '-print-settings', 'noscale',
      TEMP_PDF
    ];

    execFile(SUMATRA_PATH, args, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Error al imprimir:", error);
        return reject(error);
      }
      resolve();
    });
  });
}

// Endpoint TEST
app.post("/imprimir/test", async (req, res) => {
  try {
    const html = `
<html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Verdana', sans-serif;
        font-size: 12px;
        width: 71mm;
        color: #000;
      }

      h1, h2, h3, p, div, span {
        margin: 0;
        padding: 0;
      }

      .center { text-align: center; }
    </style>
  </head>

  <body>
    <h2 class="center" style="font-size:18px; font-weight:bold;">PRUEBA PDF</h2>

    <p style="margin-top:10px; text-align: center;">Hola mundo</p>
    <p style="text-align: center;">Esto es un test de alineación</p>
    <p style="text-align: center; margin-top: 5px;">--------------------------------</p>
    <div style="display: flex; justify-content: space-between; font-weight: bold;">
        <span>ITEM DE PRUEBA</span>
        <span>$ 1.234,56</span>
    </div>

    <br><br>
  </body>
</html>
`;


    await generarPDF(html);
    await imprimirPDF();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// Endpoint TICKET REAL
app.post("/imprimir/ticket", async (req, res) => {
  try {
    const { venta, items, empresa } = req.body;
    console.log('Printer Server Received ticket for:', venta.id);

    // Formateadores
    const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });
    const date = new Date(venta.created_at).toLocaleString('es-AR');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Verdana', sans-serif; /* Verdana es muy legible en tamaños pequeños */
                    font-size: 11px; /* Tamaño contenido */
                    width: 71mm; /* 71mm para asegurar margen derecho sin cortes */
                    color: #000;
                }
                .header { text-align: center; margin-bottom: 10px; }
                .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                .info { font-size: 11px; margin-bottom: 2px; }
                .divider { border-top: 1px dashed #000; margin: 5px 0; }
                .table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
                .table th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 2px; font-weight: bold; }
                .table td { padding: 4px 0; vertical-align: top; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                /* Totales centrados o con diseño limpio */
                .total-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
                .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
                .footer { text-align: center; margin-top: 15px; font-size: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">${empresa.nombre}</div>
                <div class="info">${empresa.direccion}</div>
                <div class="info">CUIT: ${empresa.cuit}</div>
                <div class="info">Tel: ${empresa.telefono || '-'}</div>
                ${empresa.email ? `<div class="info">${empresa.email}</div>` : ''}
            </div>

            <div class="divider"></div>

            <div class="info">Ticket N°: ${venta.id.slice(0, 8)}</div>
            <div class="info">Fecha: ${date}</div>
            <div class="info">Cliente: ${venta.cliente_nombre || 'Consumidor Final'}</div>
            <div class="info">Cajero: ${venta.usuario_nombre || 'Cajero'}</div>

            <div class="divider"></div>

            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 45%">Desc</th>
                        <th style="width: 15%" class="text-right">Cant</th>
                        <th style="width: 40%" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.nombre.substring(0, 22)}</td>
                            <td class="text-right">${item.cantidad}</td>
                            <td class="text-right">${currency.format(item.subtotal)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-row">
                    <span>TOTAL</span>
                    <span>${currency.format(venta.total)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 11px;">
                    <span>Pago (${venta.metodo_pago})</span>
                    <span>${currency.format(venta.total)}</span>
                </div>
            </div>

            <div class="footer">
                <p>${empresa.mensaje_footer || '¡Gracias por su compra!'}</p>
                <p>Conserve este ticket</p>
            </div>
            <br><br>
        </body>
        </html>
        `;

    await generarPDF(html);
    await imprimirPDF();

    res.json({ success: true });
  } catch (error) {
    console.error("Error imprimiendo ticket:", error);
    res.status(500).json({ error: error.message });
  }
});

// Limpieza al cerrar
process.on('SIGINT', async () => {
  console.log("🛑 Cerrando servidor...");
  if (browserInstance) await browserInstance.close();
  process.exit();
});

// Start
app.listen(3001, async () => {
  console.log("🔥 Printer server ON → http://localhost:3001 (Optimized V2.2)");
  console.log("📂 Configured Sumatra Path:", SUMATRA_PATH);
  // Pre-lanzar el navegador para que la primera impresión sea rápida
  await getBrowser();
});
