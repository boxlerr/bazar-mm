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
      console.log('📝 RAW TEXT START:\n', text.substring(0, 2000), '\nRAW TEXT END');

      // Detectar proveedor
      const provider = this.detectProvider(text);
      console.log('🏢 Proveedor detectado:', provider);

      if (provider === 'INFINITY') {
        return this.extractInfinityData(text);
      } else {
        // Por defecto usamos la lógica de D&G (o genérica anterior)
        return this.extractDGData(text);
      }

    } catch (error) {
      console.error('Error al parsear PDF:', error);
      throw new Error('No se pudo procesar el PDF. Verifica que sea un archivo válido.');
    }
  }

  /**
   * Detecta el proveedor basado en el contenido del texto
   */
  private static detectProvider(text: string): 'DG' | 'INFINITY' | 'UNKNOWN' {
    const firstLines = text.split('\n').slice(0, 20).join('\n');

    if (firstLines.includes('INFINITY IMPORT S.A.') || text.includes('INFINITY IMPORT S.A.')) {
      return 'INFINITY';
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
    const patterns = [
      /Total[:\s]+\$?\s*([\d.,]+)/i,
      /TOTAL[:\s]+\$?\s*([\d.,]+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return this.parsePrice(match[1]);
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

    let startIndex = -1;

    // Estrategia de detección de header relajada
    // Buscamos líneas que contengan palabras clave, incluso si están en líneas separadas
    const keywords = ['Codigo', 'Descripcion', 'Precio', 'Cantidad', 'Total'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/\s/g, ''); // Ignorar espacios para comparar
      // "CodigoDescripcion" aparece junto en el log
      if (line.includes('CodigoDescripcion') || (line.includes('Codigo') && line.includes('Descripcion'))) {
        startIndex = i + 1;
        console.log('✅ [Infinity] Header encontrado (Tipo A) en línea:', i);
        break;
      }
      // A veces los headers están distribuidos en varias líneas, si encontramos una secuencia densa, empezamos luego
      // Hack: si encontramos la fecha "Fecha:" y luego "P", asumimos que los productos vienen poco despues
      // Mejor: Buscar la primera línea que parezca un producto válido
    }

    // Si no encontramos header claro, intentar buscar patrón de producto
    if (startIndex === -1) {
      console.log('⚠️ [Infinity] Header no encontrado, buscando primer producto por patrón...');
      for (let i = 0; i < lines.length; i++) {
        if (/\d+\.\d{2}\d+/.test(lines[i]) && lines[i].length > 20) { // Tiene pinta de tener precios pegados
          startIndex = i;
          console.log('✅ [Infinity] Inicio deducido por patrón de datos en línea:', i);
          break;
        }
      }
    }

    if (startIndex === -1) {
      console.warn('⚠️ No se encontró inicio de tabla de productos (Infinity)');
      return productos;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];

      if (!line || line.length === 0) continue;

      // Stop at total line ONLY if it looks like the footer total (e.g. "TOTAL 1234.56")
      // Ignorar "Total" si es parte del header (longitud corta o sin numeros)
      if (line.match(/^TOTAL/i)) {
        // Si es solo "Total" o "Total:" es header o basura
        if (line.length < 10 && !/\d/.test(line)) {
          console.log('⚠️ [Infinity] Ignorando línea "Total" (posible header) en línea:', i);
          continue;
        }
        console.log('✅ [Infinity] Fin de tabla detectado en línea:', i);
        break;
      }

      // Ignorar líneas del header que se mezclaron
      if (['Precio unitario', 'Cantidad', 'DTO %:', 'Codigo', 'Descripcion'].some(k => line.includes(k))) {
        continue;
      }

      // Intentar regex para números "pegados" (Squashed)
      // Formato observado: Desc... Price Code Total Qty Discount
      // 5790.00 424 23160.00 4 0.00 -> 5790.0042423160.0040.00
      // Regex: (\d+\.\d{2}) (\d+) (\d+\.\d{2}) (\d+) (\d+\.\d{2})$

      // Regex estricto anclado al final
      const squashedPattern = /(\d+\.\d{2})(\d+)(\d+\.\d{2})(\d+)(\d+\.\d{2})$/;
      const match = line.match(squashedPattern);

      if (match) {
        // match[1] = Precio (5790.00)
        // match[2] = Codigo (424)
        // match[3] = Total (23160.00)
        // match[4] = Cantidad (4)
        // match[5] = Descuento (0.00)

        const description = line.substring(0, match.index).trim();
        const precioStr = match[1];
        const codigoStr = match[2];
        const totalStr = match[3];
        const cantidadStr = match[4];

        console.log(`📦 [Infinity] Producto detectado: ${description} | $${precioStr} | x${cantidadStr}`);

        productos.push({
          sku: codigoStr,
          nombre: description,
          cantidad: parseInt(cantidadStr),
          precio_unitario: parseFloat(precioStr),
          total: parseFloat(totalStr)
        });
        continue;
      }

      // Fallback: Regex con espacios (Original) por si acaso
      const spacedPattern = /(\d+(?:\.\d{2})?)\s+(\d+)\s+(\d+(?:\.\d{2})?)\s+(\d+)\s+(\d+(?:\.\d{2})?)$/;
      const matchSpaced = line.match(spacedPattern);

      if (matchSpaced) {
        const description = line.substring(0, matchSpaced.index).trim();
        const precioStr = matchSpaced[1];
        const codigoStr = matchSpaced[2];
        const totalStr = matchSpaced[3];
        const cantidadStr = matchSpaced[4];

        console.log(`📦 [Infinity] Producto detectado (espaciado): ${description}`);

        productos.push({
          sku: codigoStr,
          nombre: description,
          cantidad: parseInt(cantidadStr),
          precio_unitario: parseFloat(precioStr),
          total: parseFloat(totalStr)
        });
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
    // Remover espacios
    let cleaned = price.replace(/\s/g, '');

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

