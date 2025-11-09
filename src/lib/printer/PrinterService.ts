/**
 * Servicio de Impresión de Tickets
 * Comunica Next.js con el servidor local de impresión
 */

const PRINTER_SERVER_URL = process.env.NEXT_PUBLIC_PRINTER_SERVER_URL || 'http://localhost:3001';

export interface VentaParaImprimir {
  venta: {
    id: string;
    nro_ticket?: string;
    created_at: string;
    total: number;
    subtotal: number;
    descuento?: number;
    metodo_pago: string;
    usuario_nombre?: string;
    cliente_nombre?: string;
  };
  items: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
  empresa?: {
    nombre: string;
    direccion: string;
    telefono: string;
    cuit?: string;
  };
}

export class PrinterService {
  /**
   * Verifica si el servidor de impresión está disponible
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${PRINTER_SERVER_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch (error) {
      console.error('Servidor de impresión no disponible:', error);
      return false;
    }
  }

  /**
   * Verifica el estado de la impresora
   */
  static async checkPrinterStatus(): Promise<{
    connected: boolean;
    message?: string;
  }> {
    try {
      const response = await fetch(`${PRINTER_SERVER_URL}/impresora/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        connected: false,
        message: 'No se pudo conectar con el servidor de impresión',
      };
    }
  }

  /**
   * Imprime un ticket de venta
   */
  static async imprimirTicket(ventaData: VentaParaImprimir): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${PRINTER_SERVER_URL}/imprimir/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ventaData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al imprimir');
      }

      return {
        success: true,
        message: data.message || 'Ticket impreso correctamente',
      };
    } catch (error: any) {
      console.error('Error al imprimir ticket:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al imprimir',
      };
    }
  }

  /**
   * Imprime un ticket de prueba
   */
  static async imprimirTest(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${PRINTER_SERVER_URL}/imprimir/test`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al imprimir prueba');
      }

      return {
        success: true,
        message: data.message || 'Ticket de prueba impreso',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error al imprimir prueba',
      };
    }
  }
}
