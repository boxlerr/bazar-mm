'use client';

import { useState } from 'react';

export function BotonPruebaImpresion() {
  const [imprimiendo, setImprimiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const probarImpresion = async () => {
    setImprimiendo(true);
    setMensaje('');

    try {
      // Verificar servidor
      const healthCheck = await fetch('http://localhost:3001/health');
      
      if (!healthCheck.ok) {
        setMensaje('❌ Servidor de impresión no disponible');
        setImprimiendo(false);
        return;
      }

      // Imprimir ticket de prueba
      const response = await fetch('http://localhost:3001/imprimir/test', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('✅ ' + data.message);
      } else {
        setMensaje('❌ Error: ' + data.error);
      }
    } catch (error) {
      setMensaje('❌ No se pudo conectar con el servidor de impresión. Asegúrate de que esté corriendo en http://localhost:3001');
    } finally {
      setImprimiendo(false);
    }
  };

  const imprimirVentaEjemplo = async () => {
    setImprimiendo(true);
    setMensaje('');

    try {
      const ventaEjemplo = {
        venta: {
          id: crypto.randomUUID(),
          nro_ticket: '0001',
          created_at: new Date().toISOString(),
          total: 2500.00,
          subtotal: 2500.00,
          descuento: 0,
          metodo_pago: 'efectivo',
          usuario_nombre: 'Sistema',
          cliente_nombre: 'Cliente de Prueba',
        },
        items: [
          {
            nombre: 'Producto A',
            cantidad: 2,
            precio_unitario: 800,
            subtotal: 1600
          },
          {
            nombre: 'Producto B',
            cantidad: 3,
            precio_unitario: 300,
            subtotal: 900
          }
        ],
        empresa: {
          nombre: 'BAZAR M&M',
          direccion: 'Calle Principal 123, Buenos Aires',
          telefono: '(011) 1234-5678',
          cuit: '20-12345678-9'
        }
      };

      const response = await fetch('http://localhost:3001/imprimir/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ventaEjemplo),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('✅ Ticket de venta impreso correctamente');
      } else {
        setMensaje('❌ Error: ' + data.error);
      }
    } catch (error) {
      setMensaje('❌ No se pudo conectar con el servidor de impresión');
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
      <div className="flex items-start gap-4">
        <div className="text-4xl">🖨️</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Prueba de Impresora Térmica
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Imprime tickets de prueba con tu Gadnic TP-450s. Asegúrate de que el servidor esté corriendo en <code className="bg-purple-100 px-2 py-1 rounded text-xs">http://localhost:3001</code>
          </p>

          <div className="flex gap-3 mb-4">
            <button
              onClick={probarImpresion}
              disabled={imprimiendo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {imprimiendo ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Imprimiendo...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  <span>🧪 Ticket Simple</span>
                </>
              )}
            </button>

            <button
              onClick={imprimirVentaEjemplo}
              disabled={imprimiendo}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {imprimiendo ? (
                <span>Imprimiendo...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  <span>🎫 Ticket Completo</span>
                </>
              )}
            </button>
          </div>

          {mensaje && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              mensaje.startsWith('✅') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {mensaje}
            </div>
          )}

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <strong>💡 Recordatorio:</strong> El servidor de impresión debe estar corriendo. 
            Abre una terminal y ejecuta: <code className="bg-yellow-100 px-1 rounded">cd printer-server && npm start</code>
          </div>
        </div>
      </div>
    </div>
  );
}
