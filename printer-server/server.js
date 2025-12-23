const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Nombre EXACTO de la impresora
const PRINTER_NAME = "POS-80C";

// Ruta PDF temporal
const TEMP_PDF = path.join(os.tmpdir(), "ticket_bazar_mm.pdf");

// Ruta de SumatraPDF portable
const SUMATRA_PATH = `"C:\\Users\\boxle\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe"`;

// Generar ticket PDF 80mm
async function generarPDF(html) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: TEMP_PDF,
    width: "80mm",
    printBackground: true,
  });

  await browser.close();
}

// Imprimir usando SumatraPDF
function imprimirPDF() {
  return new Promise((resolve, reject) => {
    const comando = `${SUMATRA_PATH} -print-to "${PRINTER_NAME}" -print-settings "fit" "${TEMP_PDF}"`;

    exec(comando, (error, stdout, stderr) => {
      console.log("📄 Resultado de impresión:", stdout || stderr);

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
        padding: 0 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
      }

      h1, h2, h3, p, div, span {
        margin: 0;
        padding: 0;
      }

      .center { text-align: center; }
    </style>
  </head>

  <body>
    <h2 class="center" style="font-size:20px; font-weight:900;">PRUEBA PDF</h2>

    <p style="margin-top:10px;">Hola mundo </p>
    <p>Esto es un test</p>

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
    console.log('Printer Server Received:', { empresa });

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
                    margin: 0 auto;
                    padding: 0;
                    font-family: 'Courier New', Courier, monospace; /* Fuente monoespaciada para ticket */
                    font-size: 11px; /* Reducir un poco fuente */
                    width: 72mm; /* Ancho seguro para evitar cortes */
                    color: #000;
                }
                .header { text-align: center; margin-bottom: 10px; }
                .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                .info { font-size: 12px; margin-bottom: 2px; }
                .divider { border-top: 1px dashed #000; margin: 5px 0; }
                .table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
                .table th { text-align: left; border-bottom: 1px solid #000; }
                .table td { padding: 2px 0; vertical-align: top; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
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
                        <th style="width: 40%">Desc</th>
                        <th style="width: 20%" class="text-right">Cant</th>
                        <th style="width: 40%" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.nombre.substring(0, 20)}</td>
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
                <div style="display: flex; justify-content: space-between; margin-top: 2px; font-size: 12px;">
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

// Start
app.listen(3001, () => {
  console.log("🔥 Printer server ON → http://localhost:3001 (Updated Layout & Config)");
});
