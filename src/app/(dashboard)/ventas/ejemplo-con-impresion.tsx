'use client';

/**
 * Ejemplo de integración de impresión en página de ventas
 * Puedes copiar este código a tu página de ventas existente
 */

import { useState } from 'react';
import BotonImprimirTicket from '@/components/printer/BotonImprimirTicket';
import type { VentaParaImprimir } from '@/lib/printer/PrinterService';

export default function EjemploVentasConImpresion() {
  const [ventaActual, setVentaActual] = useState<VentaParaImprimir | null>(null);

  // Simulación de finalizar venta
  const finalizarVenta = async () => {
    // Aquí harías tu lógica normal de guardar la venta en Supabase
    const nuevaVenta: VentaParaImprimir = {
      venta: {
        id: crypto.randomUUID(),
        nro_ticket: '0001',
        created_at: new Date().toISOString(),
        total: 2500.00,
        subtotal: 2500.00,
        descuento: 0,
        metodo_pago: 'efectivo',
        usuario_nombre: 'Cajero 1',
        cliente_nombre: 'Cliente de ejemplo',
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
        direccion: 'Calle Principal 123, Ciudad',
        telefono: '(011) 1234-5678',
        cuit: '20-12345678-9'
      }
    };

    // Guardar en base de datos...
    // const { data, error } = await supabase.from('ventas').insert(...)

    // Mostrar venta para imprimir
    setVentaActual(nuevaVenta);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Ejemplo: Ventas con Impresión</h1>

      {/* Simulación de carrito */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Carrito de Compra</h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>Producto A x 2</span>
            <span>$1,600.00</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>Producto B x 3</span>
            <span>$900.00</span>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>TOTAL:</span>
            <span>$2,500.00</span>
          </div>
        </div>

        <button
          onClick={finalizarVenta}
          className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
        >
          💰 Finalizar Venta
        </button>
      </div>

      {/* Modal de venta completada con opción de imprimir */}
      {ventaActual && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-500">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              ¡Venta Completada!
            </h2>
            <p className="text-gray-600">
              Ticket Nro: {ventaActual.venta.nro_ticket}
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <p className="font-medium">{ventaActual.venta.cliente_nombre || 'Consumidor Final'}</p>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <p className="font-medium text-xl">${ventaActual.venta.total.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Método de pago:</span>
                <p className="font-medium capitalize">{ventaActual.venta.metodo_pago}</p>
              </div>
              <div>
                <span className="text-gray-600">Fecha:</span>
                <p className="font-medium">
                  {new Date(ventaActual.venta.created_at).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de imprimir */}
          <div className="space-y-3">
            <BotonImprimirTicket
              venta={ventaActual}
              onSuccess={() => {
                console.log('Ticket impreso correctamente');
              }}
              onError={(error) => {
                console.error('Error al imprimir:', error);
              }}
              className="w-full"
            />

            <button
              onClick={() => setVentaActual(null)}
              className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            💡 <strong>Tip:</strong> Asegúrate de que el servidor de impresión esté corriendo
            en <code className="bg-blue-100 px-1 rounded">http://localhost:3001</code>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-3">📝 Para usar la impresión:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
          <li>Abre una nueva terminal</li>
          <li>Navega a: <code className="bg-yellow-100 px-2 py-1 rounded">cd printer-server</code></li>
          <li>Ejecuta: <code className="bg-yellow-100 px-2 py-1 rounded">npm start</code></li>
          <li>Conecta la impresora Gadnic TP-450s por USB</li>
          <li>Haz clic en "Finalizar Venta" y luego en "Imprimir Ticket"</li>
        </ol>
      </div>
    </div>
  );
}
