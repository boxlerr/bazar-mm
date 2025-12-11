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
  } catch (error) {
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
  } catch (error) {
    console.error("❌ Error enviando test:", error);
    return { ok: false, error: error.toString() };
  }
}
