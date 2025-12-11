// lib/printer/PrinterService.ts

export interface VentaParaImprimir {
  venta: {
    id: string;
    nro_ticket: string;
    created_at: string;
    total: number;
    subtotal: number;
    descuento: number;
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
  empresa: {
    nombre: string;
    direccion: string;
    telefono: string;
    cuit: string;
  };
}

export async function imprimirHTML(html: string) {
  try {
    const res = await fetch("http://localhost:3001/imprimir/ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ html }),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error("❌ Error enviando ticket:", error);
    return { ok: false, error: error.toString() };
  }
}

export async function imprimirTest() {
  try {
    const res = await fetch("http://localhost:3001/imprimir/test", {
      method: "POST",
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return { ok: false, error: error.toString() };
  }
}

export async function checkConnection() {
  try {
    const res = await fetch("http://localhost:3001/status");
    return res.ok;
  } catch (error: any) {
    return false;
  }
}

export async function checkPrinterStatus() {
  try {
    const res = await fetch("http://localhost:3001/status");
    if (!res.ok) return { connected: false, message: "Error de servidor" };
    const data = await res.json();
    // Asumimos que el servidor devuelve { status: 'ready' | 'error', message: string }
    return {
      connected: data.status === 'ready' || data.status === 'ok',
      message: data.message || (data.status === 'ready' ? 'Lista para imprimir' : 'Estado desconocido')
    };
  } catch (error: any) {
    return { connected: false, message: "No se puede conectar con el servidor de impresión" };
  }
}
