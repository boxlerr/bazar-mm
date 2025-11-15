"use client";

import { useState } from "react";
import { imprimirHTML } from "@/lib/printer/PrinterService";

export default function BotonImprimirTicket() {
  const [msg, setMsg] = useState("");

  const enviarTicket = async () => {
    setMsg("Generando ticket...");

    const html = `
      <html>
        <body style="width:80mm; font-family: Arial;">
          <h2 style="text-align:center;">BAZAR M&M</h2>
          <p>Fecha: ${new Date().toLocaleString()}</p>

          <hr/>
          <p>Producto 1 .......... $1000</p>
          <p>Producto 2 .......... $2500</p>
          <hr/>

          <h3>Total: $3500</h3>
          <p style="text-align:center;">Gracias por su compra</p>
        </body>
      </html>
    `;

    const resultado = await imprimirHTML(html);

    if (resultado.ok) setMsg("🟢 Ticket impreso");
    else setMsg("❌ Error: " + resultado.error);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={enviarTicket}
      >
        Imprimir Ticket
      </button>

      {msg && <span>{msg}</span>}
    </div>
  );
}
