'use client';

export default function StockTable({ productos }: { productos: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{producto.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{producto.stock_actual}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {producto.stock_actual <= producto.stock_minimo ? (
                  <span className="text-red-600 font-bold">Bajo</span>
                ) : (
                  <span className="text-green-600 font-bold">Normal</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
