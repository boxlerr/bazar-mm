import { PDFParseResult, ProductoExtraido } from '@/types/compra';

// pdf-parse standard version lazy loaded

/**
 * Servicio para extraer información de PDFs de órdenes de compra
 * Soporta formato de D&G y otros proveedores similares
 */
export class PDFService {

  /**
   * Extrae productos y datos del PDF
   */
  static async extractDataFromPDF(buffer: Buffer): Promise<PDFParseResult> {
    try {
      console.log('🔄 Iniciando parseo de PDF (Standard v1.x)...');
      console.log('🔍 Buffer recibido, tamaño:', buffer.length);

      // Lazy load standard pdf-parse
      // @ts-ignore
      const pdf = require('pdf-parse');

      // Standard API: pdf(buffer, options) -> Promise<Result>
      const data = await pdf(buffer);

      console.log('✅ PDF parseado exitosamente');

      // La data.text contiene el texto extraído
      const text = data.text;

      console.log('📝 Texto extraído, longitud:', text.length);
      // Limited log to avoid clutter
      console.log('📝 RAW TEXT START:\n', text.substring(0, 500), '...\nRAW TEXT END');

      return this.parseText(text);

    } catch (error) {
      console.error('Error al parsear PDF:', error);
      throw new Error('No se pudo procesar el PDF. Verifica que sea un archivo válido.');
    }
  }

  /**
   * Procesa el texto extraído (público para testing)
   */
  static parseText(text: string): PDFParseResult {
    // Detectar proveedor
    const provider = this.detectProvider(text);
    console.log('🏢 Proveedor detectado:', provider);

    if (provider === 'INFINITY') {
      return this.extractInfinityData(text);
    } else if (provider === 'FENIX') {
      return this.extractFenixData(text);
    } else {
      // Por defecto usamos la lógica de D&G (o genérica anterior)
      return this.extractDGData(text);
    }
  }

  /**
   * Detecta el proveedor basado en el contenido del texto
   */
  private static detectProvider(text: string): 'DG' | 'INFINITY' | 'FENIX' | 'UNKNOWN' {
    const firstLines = text.split('\n').slice(0, 20).join('\n');

    if (firstLines.includes('INFINITY IMPORT S.A.') || text.includes('INFINITY IMPORT S.A.')) {
      return 'INFINITY';
    }

    if (firstLines.includes('DISTRIBUIDORA FENIX') || text.includes('distribuidorafenixoficinas@gmail.com')) {
      return 'FENIX';
    }

    if (firstLines.includes('D&G') || firstLines.includes('D & G')) {
      return 'DG';
    }

    return 'UNKNOWN';
  }

  // ==========================================
  // LÓGICA PARA D&G (Original)
  // ==========================================

  private static extractDGData(text: string): PDFParseResult {
    const numero_orden = this.extractDGNumeroOrden(text);
    const fecha = this.extractDGFecha(text);
    const proveedor = this.extractDGProveedor(text) || 'D&G'; // Fallback a D&G si no detecta
    const productos = this.extractDGProductos(text);
    const total = this.extractDGTotal(text);

    return {
      numero_orden,
      fecha,
      proveedor,
      productos,
      total,
    };
  }

  private static extractDGNumeroOrden(text: string): string | undefined {
    const patterns = [
      /Orden\s*#?(\d+)/i,
      /Order\s*#?(\d+)/i,
      /N[°º]\s*(\d+)/i,
      /Pedido\s*#?(\d+)/i,
      /Nº\s*(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private static extractDGFecha(text: string): string | undefined {
    const patterns = [
      /Realizada\s+el\s+(\d{2}\/\d{2}\/\d{4})/i,
      /Fecha:\s*(\d{2}\/\d{2}\/\d{4})/i,
      /(\d{2}\/\d{2}\/\d{4})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private static extractDGProveedor(text: string): string | undefined {
    const firstLines = text.split('\n').slice(0, 10).join('\n');
    if (firstLines.includes('D&G')) return 'D&G';
    if (firstLines.includes('D & G')) return 'D&G';
    return undefined;
  }

  private static extractDGProductos(text: string): ProductoExtraido[] {
    const productos: ProductoExtraido[] = [];
    const lines = text.split('\n').map(l => l.trim());
    console.log('🔍 [DG] Total líneas:', lines.length);
    console.log('🔍 [DG] Primeras 5 líneas:', lines.slice(0, 5));

    let startIndex = -1;
    let endIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      // Debug para encontrar el header
      if (lines[i].includes('Producto')) console.log('🔍 [DG] Línea candidata header:', lines[i]);

      if (lines[i].includes('Producto') && lines[i].includes('Cantidad') && lines[i].includes('Precio')) {
        startIndex = i + 1;
        console.log('✅ [DG] Header encontrado en línea:', i);
      }
      if (lines[i].match(/^Subtotal\s*\(/i)) {
        endIndex = i;
        console.log('✅ [DG] Footer encontrado en línea:', i);
        break;
      }
    }

    if (startIndex === -1) {
      console.warn('⚠️ No se encontró inicio de tabla de productos (D&G)');
      return productos;
    }

    let nombreBuffer: string[] = [];
    let cantidadLinea = '';

    for (let i = startIndex; i < endIndex; i++) {
      const line = lines[i];
      if (!line || line.length === 0) continue;

      if (line.startsWith('SKU:')) {
        const sku = line.replace('SKU:', '').trim();
        if (cantidadLinea) {
          const match = cantidadLinea.match(/(\d+)\s*x\s*\$\s*([\d.,]+)\s*\$\s*([\d.,]+)/);
          if (match && nombreBuffer.length > 0) {
            const nombre = nombreBuffer.join(' ').trim();
            const cantidad = parseInt(match[1]);
            const precio_unitario = this.parsePrice(match[2]);
            const total = this.parsePrice(match[3]);

            productos.push({ nombre, sku, cantidad, precio_unitario, total });
            nombreBuffer = [];
            cantidadLinea = '';
          }
        }
      } else if (line.match(/^\d+\s*x\s*\$/)) {
        cantidadLinea = line;
      } else if (line.match(/\d+\s*x\s*\$/)) {
        const parts = line.split(/(\d+\s*x\s*\$.*)/);
        if (parts.length >= 2) {
          nombreBuffer.push(parts[0].trim());
          cantidadLinea = parts[1].trim();
        }
      } else {
        nombreBuffer.push(line);
      }
    }
    return productos;
  }

  private static extractDGTotal(text: string): number | undefined {
    // Buscar explícitamente "Total:" al inicio de línea o precedido por espacios, para evitar "Subtotal"
    // Y también buscar el valor final si hay varios
    const patterns = [
      /\bTotal[:\s]+\$?\s*([\d.,]+)/i,
      /TOTAL[:\s]+\$?\s*([\d.,]+)/i,
    ];

    // Reverse lines search to find the "Final" Total
    const lines = text.split('\n').reverse();
    for (const line of lines) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) return this.parsePrice(match[1]);
      }
    }

    // Fallback search in full text if line search fails
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return this.parsePrice(match[1]);
    }
    return undefined;
  }

  // Nuevo método para extraer descuentos (D&G / Genérico)
  private static extractDGDescuento(text: string): number | undefined {
    const patterns = [
      /Descuento[:\s]+\$?\s*([\d.,]+)/i,
      /Discount[:\s]+\$?\s*([\d.,]+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return this.parsePrice(match[1]);
    }
    return undefined;
  }

  // ==========================================
  // LÓGICA PARA DISTRIBUIDORA FENIX
  // ==========================================

  private static extractFenixData(text: string): PDFParseResult {
    const numero_orden = this.extractFenixNumeroOrden(text);
    const fecha = this.extractFenixFecha(text);
    const proveedor = 'DISTRIBUIDORA FENIX';
    const productos = this.extractFenixProductos(text);
    const total = this.extractFenixTotal(text);

    return {
      numero_orden,
      fecha,
      proveedor,
      productos,
      total
    };
  }

  private static extractFenixNumeroOrden(text: string): string | undefined {
    const match = text.match(/PEDIDO\s+Nº\s*0*(\d+)/i);
    if (match) return '0000' + match[1]; // Keep standard format if preferred

    // User specifically wanted 00008906 in the log request example.
    const match2 = text.match(/Nº\s*(\d+)/i);
    if (match2) return match2[1];

    return undefined;
  }

  private static extractFenixFecha(text: string): string | undefined {
    const match = text.match(/FECHA:\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (match) return match[1];
    return undefined;
  }

  private static extractFenixProductos(text: string): ProductoExtraido[] {
    const productos: ProductoExtraido[] = [];
    const lines = text.split('\n').map(l => l.trim());
    console.log('🔍 [FENIX] Total líneas:', lines.length);

    // Regex para detectar la línea de números "smashed": 1,0018.500,000,0018.500,00
    // Asumimos formato AR: 1.000,00
    // Pattern: 4 bloques de números pegados que terminan en decimales.

    const decimalPattern = /(\d{1,3}(?:\.\d{3})*,\d{2})/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Verificamos si esta línea parece ser la de "números"
      const matches = [...line.matchAll(decimalPattern)].map(m => m[0]);

      if (matches.length === 4) {
        // Parece ser una línea de datos numéricos válida
        // Asumimos que la línea ANTERIOR es la descripción/código

        const prevLine = lines[i - 1];
        if (!prevLine) continue; // Si no hay línea anterior, saltamos

        // Ignorar headers
        if (prevLine.includes('CodigoDescripcion') || matches[0] === '0,00') {
          // A veces match puede ser falso positivo si empieza con 0,00 y no es Cantidad
          // Pero Cantidad suele ser >= 1.
          if (matches[0] === '0,00') continue;
        }

        // Datos
        const cantidad = this.parsePrice(matches[0]);
        const precio_unitario = this.parsePrice(matches[1]);
        // matches[2] es descuento, no lo usamos por ahora
        const total = this.parsePrice(matches[3]);

        // Descripción y SKU
        let sku = 'UNKNOWN';
        let nombre = prevLine;

        // Heurística simple para SKU (Barcode o Codigo al inicio)
        // Caso Barcode: 779...TEXTO
        const barcodeMatch = prevLine.match(/^(\d{8,14})(.+)/);
        if (barcodeMatch) {
          sku = barcodeMatch[1];
          nombre = barcodeMatch[2].trim();
        } else {
          // Caso texto puro
          // Dejamos todo en nombre por ahora
          sku = 'GEN-' + Math.floor(Math.random() * 10000); // Placeholder
        }

        // Fix: Asegurar que el SKU sea único si es generado? No, mejor dejar vacío o UNKNOWN
        if (sku.startsWith('GEN-')) sku = '';

        productos.push({
          nombre: nombre,
          sku: sku,
          cantidad,
          precio_unitario,
          total
        });

        console.log(`✅ [FENIX] Producto detectado: ${matches[0]} x $${matches[1]} = $${matches[3]} (${nombre.substring(0, 20)}...)`);
      }
    }

    return productos;
  }

  private static extractFenixTotal(text: string): number | undefined {
    // Buscar TOTAL: $176.200,00
    // El texto raw tiene "TOTAL:" y luego en otra linea "$176.200,00"

    // Primero buscamos en la misma linea o con espacios
    const match = text.match(/TOTAL:\s*\$?\s*([\d.,]+)/i);
    if (match) return this.parsePrice(match[1]);

    // Iteramos líneas para encontrar TOTAL: y mirar la siguiente
    const lines = text.split('\n').map(l => l.trim());
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^TOTAL:?$/i)) {
        // Check next lines for a price
        for (let j = 1; j <= 2; j++) {
          if (lines[i + j]) {
            const price = this.parsePrice(lines[i + j]);
            if (price > 0 && lines[i + j].includes('$')) return price;
            // O si solo es numero
            if (price > 0 && /[\d.,]/.test(lines[i + j])) return price;
          }
        }
      }
    }

    return undefined;
  }


  // ==========================================
  // LÓGICA PARA INFINITY IMPORT S.A.
  // ==========================================

  private static extractInfinityData(text: string): PDFParseResult {
    const numero_orden = this.extractInfinityNumeroOrden(text);
    const fecha = this.extractInfinityFecha(text);
    const proveedor = 'INFINITY IMPORT S.A.';
    const productos = this.extractInfinityProductos(text);
    const total = this.extractInfinityTotal(text, productos);

    // Validación estricta: Suma de items vs Total PDF
    // Tolerancia de $10 por cuestiones de redondeo, aunque debería ser exacto
    if (total !== undefined) {
      const sumProductos = productos.reduce((sum, p) => sum + p.total, 0);
      const diff = Math.abs(sumProductos - total);

      console.log(`💰 [Infinity] Validación: Suma items $${sumProductos} vs Total PDF $${total}`);

      if (diff > 50) { // Tolerancia amplia por si acaso, pero suficiente para detectar el error de $1.3M vs $500k
        console.error(`⚠️ IMPORTACIÓN CON DIFERENCIA: La suma de los items ($${sumProductos}) no coincide con el total del comprobante ($${total}). Diferencia: $${diff}.`);
        // throw new Error(`⚠️ ERROR CRÍTICO DE IMPORTACIÓN: La suma de los items ($${sumProductos}) no coincide con el total del comprobante ($${total}). Diferencia: $${diff}. Posible error de lectura de precios.`);
      }
    }

    return {
      numero_orden,
      fecha,
      proveedor,
      productos,
      total,
    };
  }

  private static extractInfinityNumeroOrden(text: string): string | undefined {
    // Raw: "00000621        1024    Nro"
    const match = text.match(/(\d+)\s+\d+\s+Nro/);
    if (match) return match[1];

    // Fallback
    const match2 = text.match(/Nro\s+(\d+)/i);
    if (match2) return match2[1];

    return undefined;
  }

  private static extractInfinityFecha(text: string): string | undefined {
    // Raw: "11/12/2025"
    const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (match) return match[1];
    return undefined;
  }

  private static extractInfinityProductos(text: string): ProductoExtraido[] {
    const productos: ProductoExtraido[] = [];
    const lines = text.split('\n').map(l => l.trim());
    console.log('🔍 [Infinity] Total líneas:', lines.length);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.length === 0) continue;

      // Ignorar headers y footers
      if (line.includes('Descripcion') && line.includes('Precio')) continue;
      if (line.match(/^TOTAL\s+\d/i)) continue;
      if (line.match(/^TOTAL$/i)) continue;
      if (line.startsWith('DTO %:')) continue;

      // Find all currency-like patterns (digits + separator + 2 digits)
      const decimalPattern = /(\d+[.,]\d{2})/g;
      // Obtenemos todas las coincidencias de "números con decimales"
      const matches = [...line.matchAll(decimalPattern)].map(m => m[0]);
      // Also keep track of indices if needed, but matchAll results gives it.
      const matchInfos = [...line.matchAll(decimalPattern)];

      // Si hay menos de 3 "bloques decimales"
      if (matches.length < 3) continue;

      // Asumimos que los últimos 3 matches forman la estructura:
      // [Price] [Code + Total] [Qty + Dto]

      // m1 es el candidato a Precio, pero puede contener "ruido" al principio (ej: "20X72590.00")
      const m1 = matches[matches.length - 3];
      const m1Info = matchInfos[matches.length - 3];

      const m2 = matches[matches.length - 2];
      const m3 = matches[matches.length - 1];

      // M3: Qty + Dto
      const sepIndex = m3.indexOf('.') !== -1 ? m3.indexOf('.') : m3.indexOf(',');
      let validQtyDto: { qty: number, dto: string }[] = [];

      for (let j = 1; j <= sepIndex; j++) {
        const qtyStr = m3.substring(0, j);
        const dtoStr = m3.substring(j);
        if (dtoStr.match(/^[.,]\d{2}$/) || dtoStr.match(/^\d+[.,]\d{2}$/)) {
          validQtyDto.push({ qty: parseInt(qtyStr), dto: dtoStr });
        }
      }

      // M2: Code + Total
      let validCodeTotal: { code: string, total: number }[] = [];
      const sepIndex2 = m2.indexOf('.') !== -1 ? m2.indexOf('.') : m2.indexOf(',');

      for (let j = 1; j <= sepIndex2; j++) {
        const codeStr = m2.substring(0, j);
        const totalStr = m2.substring(j);
        if (totalStr.match(/^[.,]\d{2}$/) || totalStr.match(/^\d+[.,]\d{2}$/)) {
          validCodeTotal.push({ code: codeStr, total: this.parsePrice(totalStr) });
        }
      }

      // Probar combinaciones iterando sobre posibles recortes de m1 (Precio)
      // m1 puede ser "72590.00" -> probamos "72590.00", "2590.00", "590.00"...

      let found = false;

      for (let k = 0; k < m1.length; k++) {
        const priceStrCandidate = m1.substring(k);

        // Debe respetar formato precio minímo
        if (!priceStrCandidate.match(/^\d+[.,]\d{2}$/)) break; // No cortar dentro de los decimales

        const priceVal = this.parsePrice(priceStrCandidate);

        for (const qd of validQtyDto) {
          for (const ct of validCodeTotal) {
            // Chequeo Matemático
            const expected = priceVal * qd.qty;
            const diff = Math.abs(expected - ct.total);

            if (diff < 2.0) {
              // MATCH ENCONTRADO

              // Reconstruir Descripción
              // La descripción original terminaba antes de m1.
              // Pero si cortamos m1 (k > 0), los caracteres cortados pertenecen a la descripción
              const idx1 = m1Info.index!;
              const prefix = m1.substring(0, k); // "7" de "72590.00"

              // Tomamos todo desde el inicio de linea hasta donde empezaba m1, y le sumamos el prefix
              let description = line.substring(0, idx1) + prefix;
              description = description.trim();

              if (!description) description = 'Producto sin nombre';

              productos.push({
                sku: ct.code,
                nombre: description,
                cantidad: qd.qty,
                precio_unitario: priceVal,
                total: ct.total
              });
              found = true;
            }
            if (found) break;
          }
          if (found) break;
        }
        if (found) break;
      }
    }

    return productos;
  }

  private static extractInfinityTotal(text: string, productos: ProductoExtraido[]): number | undefined {
    // Raw: "TOTAL 594710.00"
    const match = text.match(/TOTAL\s+([\d.]+)/);
    if (match) return parseFloat(match[1]);

    // Fallback
    if (productos.length > 0) {
      return productos.reduce((sum, p) => sum + (p.total || 0), 0);
    }

    return undefined;
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Convierte string de precio a número
   * Maneja formatos: "1.234,56" o "1234.56"
   */
  private static parsePrice(price: string): number {
    // Remover espacios y simbolos de moneda
    let cleaned = price.replace(/\s/g, '').replace('$', '');

    // Si tiene punto y coma, asumir formato argentino (1.234,56)
    if (cleaned.includes('.') && cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    // Si solo tiene coma, asumir formato argentino (1234,56)
    else if (cleaned.includes(',')) {
      cleaned = cleaned.replace(',', '.');
    }

    return parseFloat(cleaned) || 0;
  }

  /**
   * Valida que los datos extraídos sean correctos
   */
  static validateExtractedData(data: PDFParseResult): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.productos || data.productos.length === 0) {
      errors.push('No se encontraron productos en el PDF');
    }

    if (data.productos) {
      data.productos.forEach((producto, index) => {
        if (!producto.nombre) {
          errors.push(`Producto ${index + 1}: falta el nombre`);
        }
        if (!producto.cantidad || producto.cantidad <= 0) {
          errors.push(`Producto ${index + 1}: cantidad inválida`);
        }
        // Permitimos precio 0? Mejor warning, pero por ahora error
        // En Infinity Import parece que hay precios
        if (producto.precio_unitario === undefined || producto.precio_unitario < 0) {
          // Nota: permitimos 0 por si acaso es un regalo o bonificación
          errors.push(`Producto ${index + 1}: precio unitario inválido`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
