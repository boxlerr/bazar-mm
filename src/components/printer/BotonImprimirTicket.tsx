'use client';

import { useState } from 'react';
import { PrinterService, VentaParaImprimir } from '@/lib/printer/PrinterService';

interface BotonImprimirTicketProps {
  venta: VentaParaImprimir;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function BotonImprimirTicket({
  venta,
  onSuccess,
  onError,
  className = '',
}: BotonImprimirTicketProps) {
  const [imprimiendo, setImprimiendo] = useState(false);

  const handleImprimir = async () => {
    setImprimiendo(true);

    try {
      // Verificar conexión primero
      const conectado = await PrinterService.checkConnection();
      
      if (!conectado) {
        const mensaje = 'Servidor de impresión no disponible. Asegúrate de que esté corriendo.';
        onError?.(mensaje);
        alert(mensaje);
        setImprimiendo(false);
        return;
      }

      // Imprimir ticket
      const resultado = await PrinterService.imprimirTicket(venta);

      if (resultado.success) {
        onSuccess?.();
        alert('✅ Ticket impreso correctamente');
      } else {
        onError?.(resultado.error || 'Error desconocido');
        alert(`❌ Error al imprimir: ${resultado.error}`);
      }
    } catch (error) {
      const mensaje = 'Error inesperado al imprimir';
      onError?.(mensaje);
      alert(`❌ ${mensaje}`);
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <button
      onClick={handleImprimir}
      disabled={imprimiendo}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
    >
      {imprimiendo ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Imprimiendo...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          <span>Imprimir Ticket</span>
        </>
      )}
    </button>
  );
}
