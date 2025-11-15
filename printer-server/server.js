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

// Start
app.listen(3001, () => {
  console.log("🔥 Printer server ON → http://localhost:3001");
});
