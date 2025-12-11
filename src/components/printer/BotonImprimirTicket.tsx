"use client";

import { useState } from "react";
import { imprimirHTML, type VentaParaImprimir } from "@/lib/printer/PrinterService";

interface Props {
  venta: VentaParaImprimir | null;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export default function BotonImprimirTicket({ venta, onSuccess, onError, className }: Props) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarTicket = async () => {
    if (!venta) {
      setMsg("❌ No hay venta para imprimir");
      return;
    }

    setLoading(true);
    setMsg("Generando ticket...");

    try {
      // Formato simple de fecha
      const date = new Date(venta.venta.created_at).toLocaleString('es-AR');

      // Generar items HTML
      const itemsHtml = venta.items.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>${item.nombre} <small>x${item.cantidad}</small></span>
            <span>$${item.subtotal.toFixed(2)}</span>
        </div>
      `).join('');

      const html = `
        <html>
          <body style="width: 80mm; font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 5px;">
            <div style="text-align: center; margin-bottom: 10px;">
              <h2 style="margin: 0; font-size: 16px;">${venta.empresa.nombre}</h2>
              <p style="margin: 2px 0;">${venta.empresa.direccion}</p>
              <p style="margin: 2px 0;">Tel: ${venta.empresa.telefono}</p>
              <p style="margin: 2px 0;">CUIT: ${venta.empresa.cuit}</p>
            </div>
            
            <div style="margin-bottom: 10px; border-bottom: 1px dashed black; padding-bottom: 5px;">
              <p style="margin: 2px 0;">Fecha: ${date}</p>
              <p style="margin: 2px 0;">Ticket: #${venta.venta.nro_ticket}</p>
              <p style="margin: 2px 0;">Cliente: ${venta.venta.cliente_nombre || 'Consumidor Final'}</p>
              <p style="margin: 2px 0;">Pago: ${venta.venta.metodo_pago.toUpperCase()}</p>
            </div>
            
            <div style="margin-bottom: 10px;">
              ${itemsHtml}
            </div>

            <div style="border-top: 1px dashed black; padding-top: 5px; margin-top: 5px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
                <span>TOTAL:</span>
                <span>$${venta.venta.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="margin: 0;">¡Gracias por su compra!</p>
            </div>
          </body>
        </html>
      `;

      const resultado = await imprimirHTML(html);

      if (resultado.ok) {
        setMsg("🟢 Ticket impreso");
        if (onSuccess) onSuccess();
      } else {
        setMsg("❌ Error: " + resultado.error);
        if (onError) onError(resultado.error);
      }
    } catch (error: any) {
      console.error("Error al imprimir:", error);
      setMsg("❌ Error de comunicación");
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      <button
        className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm active:scale-95 transform duration-100`}
        onClick={enviarTicket}
        disabled={loading || !venta}
      >
        {loading ? 'Imprimiendo...' : '🖨️ Imprimir Ticket'}
      </button>

      {msg && <span className="text-xs text-center font-medium text-gray-700">{msg}</span>}
    </div>
  );
}
