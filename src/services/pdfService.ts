import { PDFParseResult, ProductoExtraido } from '@/types/compra';

// pdf-parse v2.x usa una nueva API de clases completamente diferente
const pdfModule = require('pdf-parse');
const { PDFParse } = pdfModule;

console.log('✅ PDFParse v2.x cargado');

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
      console.log('🔄 Iniciando parseo de PDF v2.x...');
      console.log('🔍 Buffer recibido, tamaño:', buffer.length);
      
      // Crear instancia del parser pasando el buffer en las opciones
      console.log('📘 Creando parser con buffer en opciones...');
      const parser = new PDFParse({
        data: buffer, // Pasar buffer directamente
        max: 0, // Sin límite de páginas
        verbosity: 0,
      });
      
      console.log('📘 Extrayendo texto con getText()...');
      const result = await parser.getText();
      
      console.log('✅ getText() completado');
      console.log('🔍 Tipo de resultado:', typeof result);
      console.log('🔍 Resultado completo:', result);
      
      // getText() devuelve un objeto, necesitamos extraer el texto
      const text = typeof result === 'string' ? result : (result?.text || result?.content || JSON.stringify(result));
      
      console.log('📄 PDF procesado exitosamente');
      console.log('📝 Texto extraído, longitud:', text.length);
      console.log('📝 Primeros 500 caracteres:', text.substring(0, 500));
      
      // Extraer información
      const numero_orden = this.extractNumeroOrden(text);
      const fecha = this.extractFecha(text);
      const proveedor = this.extractProveedor(text);
      const productos = this.extractProductos(text);
      const total = this.extractTotal(text);
      
      return {
        numero_orden,
        fecha,
        proveedor,
        productos,
        total,
      };
    } catch (error) {
      console.error('Error al parsear PDF:', error);
      throw new Error('No se pudo procesar el PDF. Verifica que sea un archivo válido.');
    }
  }
  
  /**
   * Extrae el número de orden del PDF
   */
  private static extractNumeroOrden(text: string): string | undefined {
    // Buscar patrones como "Orden #2527", "Order #123", "N° 456"
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
  
  /**
   * Extrae la fecha de la orden
   */
  private static extractFecha(text: string): string | undefined {
    // Buscar patrones de fecha
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
  
  /**
   * Extrae el nombre del proveedor
   */
  private static extractProveedor(text: string): string | undefined {
    // Buscar logos o nombres de empresa en las primeras líneas
    const firstLines = text.split('\n').slice(0, 10).join('\n');
    
    // Patrones comunes
    if (firstLines.includes('D&G')) return 'D&G';
    if (firstLines.includes('D & G')) return 'D&G';
    
    return undefined;
  }
  
  /**
   * Extrae los productos del PDF
   * Estrategia: Buscar líneas con SKU y trabajar hacia atrás para el nombre
   */
  private static extractProductos(text: string): ProductoExtraido[] {
    const productos: ProductoExtraido[] = [];
    const lines = text.split('\n').map(l => l.trim());
    
    // Buscar desde el inicio hasta encontrar "Subtotal"
    let startIndex = -1;
    let endIndex = lines.length;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Producto') && lines[i].includes('Cantidad') && lines[i].includes('Precio')) {
        startIndex = i + 1;
      }
      if (lines[i].match(/^Subtotal\s*\(/i)) {
        endIndex = i;
        break;
      }
    }
    
    if (startIndex === -1) {
      console.warn('⚠️ No se encontró inicio de tabla de productos');
      return productos;
    }
    
    // Procesar línea por línea buscando SKUs
    let nombreBuffer: string[] = [];
    let cantidadLinea = '';
    
    for (let i = startIndex; i < endIndex; i++) {
      const line = lines[i];
      
      if (!line || line.length === 0) continue;
      
      // Si es un SKU, procesamos el producto completo
      if (line.startsWith('SKU:')) {
        const sku = line.replace('SKU:', '').trim();
        
        // La línea anterior debe tener cantidad y precios
        if (cantidadLinea) {
          // Patrón: "10 x $ 6.933,00 $ 69.330,00"
          const match = cantidadLinea.match(/(\d+)\s*x\s*\$\s*([\d.,]+)\s*\$\s*([\d.,]+)/);
          
          if (match && nombreBuffer.length > 0) {
            const nombre = nombreBuffer.join(' ').trim();
            const cantidad = parseInt(match[1]);
            const precio_unitario = this.parsePrice(match[2]);
            const total = this.parsePrice(match[3]);
            
            productos.push({
              nombre,
              sku,
              cantidad,
              precio_unitario,
              total,
            });
            
            // Resetear buffers
            nombreBuffer = [];
            cantidadLinea = '';
          }
        }
      }
      // Si contiene patrón de cantidad (número + x + $)
      else if (line.match(/^\d+\s*x\s*\$/)) {
        cantidadLinea = line;
      }
      // Caso especial: línea con producto + cantidad en misma línea
      // Ejemplo: "Secaplatos Escurridor Acero Cromado 2 Pisos 3 x $ 28.069,00 $ 84.207,00"
      else if (line.match(/\d+\s*x\s*\$/)) {
        // Separar nombre de cantidad/precio
        const parts = line.split(/(\d+\s*x\s*\$.*)/);
        if (parts.length >= 2) {
          nombreBuffer.push(parts[0].trim());
          cantidadLinea = parts[1].trim();
        }
      }
      // Si no es SKU ni cantidad, es parte del nombre
      else {
        nombreBuffer.push(line);
      }
    }
    
    console.log(`📦 Extraídos ${productos.length} productos del PDF`);
    
    return productos;
  }
  
  /**
   * Extrae el total de la orden
   */
  private static extractTotal(text: string): number | undefined {
    const patterns = [
      /Total[:\s]+\$?\s*([\d.,]+)/i,
      /TOTAL[:\s]+\$?\s*([\d.,]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return this.parsePrice(match[1]);
      }
    }
    
    return undefined;
  }
  
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
        if (!producto.precio_unitario || producto.precio_unitario <= 0) {
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

