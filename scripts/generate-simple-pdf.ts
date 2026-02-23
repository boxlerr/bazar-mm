
const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

// Create a new PDF document
const doc = new jsPDF();

// Add content
doc.setFontSize(20);
doc.text('FACTURA TEST - PROVEEDOR NUEVO', 20, 20);

doc.setFontSize(12);
doc.text('Orden No: 998877', 20, 40);
doc.text('Fecha: 18/02/2026', 20, 50);

doc.text('------------------------------------------------', 20, 65);
doc.text('Descripcion           Cant    Precio    Total', 20, 70);
doc.text('------------------------------------------------', 20, 75);

// Items
// Format: Description (20) Qty (30) Price (40) Total (50)
const items = [
    { desc: 'Producto A - Test', qty: 2, price: 100.50, total: 201.00 },
    { desc: 'Producto B - Test', qty: 10, price: 50.00, total: 500.00 },
    { desc: 'Producto C - Test', qty: 1, price: 1200.00, total: 1200.00 },
];

let y = 85;
items.forEach(item => {
    // Simple spacing for text extraction
    // We want regex: ^(.+?)\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)$
    // So we need clear spaces between columns
    const line = `${item.desc.padEnd(20)} ${item.qty}     ${item.price.toFixed(2)}    ${item.total.toFixed(2)}`;
    doc.text(line, 20, y);
    y += 10;
});

doc.text('------------------------------------------------', 20, y);
y += 10;
doc.setFontSize(14);
doc.text('Total: $1901.00', 20, y);

// Save the PDF
const outputPath = path.resolve(__dirname, '../public/test_invoice.pdf');
const pdfOutput = doc.output('arraybuffer');

fs.writeFileSync(outputPath, Buffer.from(pdfOutput));

console.log(`✅ PDF generado en: ${outputPath}`);
console.log('Ahora puedes subir este archivo en la sección de Plantillas PDF.');
