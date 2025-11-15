"use client";

import { useState } from "react";
import { imprimirTest } from "@/lib/printer/PrinterService";

export default function BotonPruebaImpresion() {
  const [estado, setEstado] = useState("");

  const handleTest = async () => {
    setEstado("Imprimiendo...");

    const resultado = await imprimirTest();

    if (resultado.ok) {
      setEstado("🟢 Impreso correctamente");
    } else {
      setEstado("❌ Error: " + resultado.error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleTest}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Imprimir TEST
      </button>

      {estado && <span>{estado}</span>}
    </div>
  );
}
