# Script de Prueba para Extracción de PDF

Este script te permite probar la extracción de datos de un PDF localmente.

## Uso

1. Coloca un PDF de prueba en esta carpeta
2. Ejecuta el script:

```bash
node test-pdf.js
```

## Archivo de Prueba

```javascript
// test-pdf.js
const fs = require('fs');
const pdf = require('pdf-parse');

async function testPDF() {
  // Leer el PDF
  const dataBuffer = fs.readFileSync('./orden-ejemplo.pdf');
  
  try {
    const data = await pdf(dataBuffer);
    
    console.log('=== TEXTO EXTRAÍDO ===');
    console.log(data.text);
    console.log('\n=== PÁGINAS ===');
    console.log('Total:', data.numpages);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPDF();
```

## Resultado Esperado

El script debería mostrar todo el texto del PDF, incluyendo:
- Número de orden
- Fecha
- Productos con cantidades
- Códigos SKU
- Precios

Usa esta información para ajustar los patrones de extracción en `src/services/pdfService.ts`
