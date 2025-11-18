'use client';

import { useState } from 'react';
import { Package, Edit2, Save, X, Trash2 } from 'lucide-react';

interface ProductoItem {
  id: string;
  producto: {
    nombre: string;
    codigo: string;
    codigo_barra?: string;
    categoria: string;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Props {
  items: ProductoItem[];
  compraId: string;
  total: number;
}

export default function TablaProductosEditable({ items, compraId, total }: Props) {
  const [editando, setEditando] = useState(false);
  const [productos, setProductos] = useState(items);
  const [loading, setLoading] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const parseNumber = (str: string): number => {
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleNombreChange = (index: number, value: string) => {
    const newProductos = [...productos];
    newProductos[index].producto.nombre = value;
    setProductos(newProductos);
  };

  const handleCodigoChange = (index: number, value: string) => {
    const newProductos = [...productos];
    newProductos[index].producto.codigo_barra = value;
    setProductos(newProductos);
  };

  const handleCategoriaChange = (index: number, value: string) => {
    const newProductos = [...productos];
    newProductos[index].producto.categoria = value;
    setProductos(newProductos);
  };

  const handleCantidadChange = (index: number, value: string) => {
    const cantidad = parseInt(value) || 0;
    const newProductos = [...productos];
    newProductos[index].cantidad = cantidad;
    newProductos[index].subtotal = cantidad * newProductos[index].precio_unitario;
    setProductos(newProductos);
  };

  const handlePrecioChange = (index: number, value: string) => {
    const precio = parseNumber(value);
    const newProductos = [...productos];
    newProductos[index].precio_unitario = precio;
    newProductos[index].subtotal = newProductos[index].cantidad * precio;
    setProductos(newProductos);
  };

  const handleEliminarItem = (index: number) => {
    if (confirm('¿Estás seguro de eliminar este producto de la compra?')) {
      const newProductos = productos.filter((_, i) => i !== index);
      setProductos(newProductos);
    }
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      // Actualizar cada item y su producto
      for (const item of productos) {
        // Actualizar el item de compra
        const responseItem = await fetch(`/api/compras/${compraId}/items/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.subtotal,
            producto: {
              nombre: item.producto.nombre,
              codigo_barra: item.producto.codigo_barra,
              categoria: item.producto.categoria,
            },
          }),
        });

        if (!responseItem.ok) {
          throw new Error('Error al actualizar item');
        }
      }

      // Actualizar total de la compra
      const nuevoTotal = productos.reduce((sum, item) => sum + item.subtotal, 0);
      await fetch(`/api/compras/${compraId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: nuevoTotal }),
      });

      setEditando(false);
      // Recargar la página para ver los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setProductos(items);
    setEditando(false);
  };

  const calcularTotal = () => {
    return productos.reduce((sum, item) => sum + item.subtotal, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Productos de la Compra
        </h2>
        {!editando ? (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelar}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition font-medium disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                SKU / Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                Precio Unitario
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                Subtotal
              </th>
              {editando && (
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editando ? (
                    <input
                      type="text"
                      value={item.producto.nombre}
                      onChange={(e) => handleNombreChange(index, e.target.value)}
                      className="w-full px-2 py-1 border-2 border-blue-500 rounded text-sm font-bold text-gray-900"
                    />
                  ) : (
                    <div className="text-sm font-bold text-gray-900">{item.producto.nombre}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editando ? (
                    <input
                      type="text"
                      value={item.producto.codigo_barra || item.producto.codigo || ''}
                      onChange={(e) => handleCodigoChange(index, e.target.value)}
                      className="w-full px-2 py-1 border-2 border-blue-500 rounded text-sm font-medium text-gray-900"
                      placeholder="SKU"
                    />
                  ) : (
                    <div className="text-sm text-gray-900 font-medium">
                      {item.producto.codigo_barra || item.producto.codigo || '-'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editando ? (
                    <input
                      type="text"
                      value={item.producto.categoria}
                      onChange={(e) => handleCategoriaChange(index, e.target.value)}
                      className="w-full px-2 py-1 border-2 border-blue-500 rounded text-xs font-semibold text-gray-900"
                    />
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.producto.categoria}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editando ? (
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleCantidadChange(index, e.target.value)}
                      className="w-20 px-2 py-1 border-2 border-blue-500 rounded text-sm font-bold text-gray-900 text-right"
                    />
                  ) : (
                    <div className="text-sm font-bold text-gray-900">{item.cantidad}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editando ? (
                    <input
                      type="text"
                      value={formatNumber(item.precio_unitario)}
                      onChange={(e) => handlePrecioChange(index, e.target.value)}
                      className="w-32 px-2 py-1 border-2 border-blue-500 rounded text-sm font-bold text-gray-900 text-right"
                    />
                  ) : (
                    <div className="text-sm font-bold text-gray-900">${formatNumber(item.precio_unitario)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-green-600">${formatNumber(item.subtotal)}</div>
                </td>
                {editando && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEliminarItem(index)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={editando ? 6 : 5} className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                TOTAL:
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-xl font-bold text-green-600">${formatNumber(calcularTotal())}</div>
              </td>
              {editando && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
