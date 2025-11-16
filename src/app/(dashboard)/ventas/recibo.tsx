'use client';

export default function ReciboVenta({ venta }: { venta: any }) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // Implementar generación de PDF
    console.log('Descargando PDF...');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bazar M&M</h1>
          <p className="text-gray-900 font-medium">Recibo de Venta</p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Recibo #</p>
              <p className="font-semibold text-gray-900">{venta?.id}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Fecha</p>
              <p className="font-semibold text-gray-900">
                {venta?.created_at ? new Date(venta.created_at).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Detalles de la Venta</h3>
          {/* Aquí irían los items de la venta */}
        </div>

        <div className="text-right mb-8">
          <div className="inline-block">
            <div className="flex justify-between mb-2">
              <span className="mr-8">Subtotal:</span>
              <span className="font-semibold">${venta?.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="mr-8">IVA:</span>
              <span className="font-semibold">${venta?.iva?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span className="mr-8">Total:</span>
              <span>${venta?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Imprimir
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
