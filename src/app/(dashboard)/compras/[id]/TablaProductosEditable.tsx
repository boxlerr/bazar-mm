'use client';

import { useState } from 'react';
import { Package, Edit2, Save, X, Trash2, Loader2, Scissors, Barcode, ArrowRight, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Componente Modal Simple
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

interface ProductoItem {
  id: string;
  producto: {
    nombre: string;
    codigo: string;
    codigo_barra?: string;
    categoria: string;
    units_per_pack?: number;
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

  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [splitItem, setSplitItem] = useState<{ index: number; item: ProductoItem } | null>(null);
  const [splitUnits, setSplitUnits] = useState<number>(1);
  const [splitBarcode, setSplitBarcode] = useState<string>('');

  const extractPackSize = (name: string): number | null => {
    // Regex para PACK X 6, CAJA X 12, SET DE 4, etc.
    const regex = /(?:PACK|SET|CAJA).*?X\s*(\d+)|X\s*(\d+)\s*(?:UNIDADES|UNIDS|U\.|U)|\sX\s?(\d+)\b/i;
    const match = name.match(regex);
    if (match) return parseInt(match[1] || match[2] || match[3]);

    // Fallbacks comunes pegados
    if (name.toUpperCase().includes('X6')) return 6;
    if (name.toUpperCase().includes('X12')) return 12;
    if (name.toUpperCase().includes('X4')) return 4;
    return null;
  };

  // Efecto para cargar datos iniciales del split cuando se abre
  const openSplitModal = (index: number, item: ProductoItem) => {
    setSplitItem({ index, item });

    let defaultUnits = 1;

    // 1. Historial
    if (item.producto.units_per_pack && item.producto.units_per_pack > 1) {
      defaultUnits = item.producto.units_per_pack;
    } else {
      // 2. Detección Inteligente
      const detected = extractPackSize(item.producto.nombre);
      if (detected && detected > 1) defaultUnits = detected;
    }

    setSplitUnits(defaultUnits);
    setSplitBarcode('');
  };

  const handleSplitSave = () => {
    if (!splitItem) return;
    if (splitUnits <= 1) {
      toast.error('Las unidades por pack deben ser mayores a 1');
      return;
    }

    const { index, item } = splitItem;
    const newProductos = [...productos];

    // Cálculos
    const currentQty = item.cantidad;
    const currentPrice = item.precio_unitario;

    // Actualizar item
    newProductos[index].cantidad = currentQty * splitUnits;
    newProductos[index].precio_unitario = currentPrice / splitUnits;

    // Actualizar producto info
    newProductos[index].producto.units_per_pack = splitUnits; // Guardar preferencia
    if (splitBarcode) {
      newProductos[index].producto.codigo_barra = splitBarcode;
    }

    // Mantener subtotal (debería ser igual matemáticamente, pero forzamos recalculación limpia)
    newProductos[index].subtotal = newProductos[index].cantidad * newProductos[index].precio_unitario;

    setProductos(newProductos);
    setSplitItem(null);
    toast.success('Pack desglosado correctamente');
  };

  const isPackSuspect = (nombre: string) => {
    const keywords = ['PACK', 'SET', 'CAJA', 'X6', 'X12', 'X4', 'X 6', 'X 12'];
    const upper = nombre.toUpperCase();
    return keywords.some(k => upper.includes(k));
  };

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

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      const newProductos = productos.filter((_, i) => i !== itemToDelete);
      setProductos(newProductos);
      setItemToDelete(null);
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
              units_per_pack: item.producto.units_per_pack,
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
      toast.error('Error al guardar los cambios');
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
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <span className="hidden md:inline">Productos de la Compra</span>
            <span className="md:hidden">Productos</span>
            <span className="bg-gray-100 text-gray-600 text-xs md:text-sm px-2 py-1 rounded-full font-medium">
              {productos.length}
            </span>
          </h2>

          <AnimatePresence mode="wait">
            {!editando ? (
              <motion.button
                key="edit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setEditando(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow text-sm md:text-base"
              >
                <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Editar
              </motion.button>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-2"
              >
                <button
                  onClick={handleCancelar}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all font-medium disabled:opacity-50 shadow-sm text-sm md:text-base"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Cancelar</span>
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all font-medium disabled:opacity-50 shadow-sm hover:shadow text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                      <span className="hidden sm:inline">Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      Guardar
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SKU / Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Precio Unitario
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
                {editando && (
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {productos.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`hover:bg-gray-50/50 transition-colors ${editando ? 'bg-blue-50/20' : ''}`}
                  >
                    <td className="px-6 py-4">
                      {editando ? (
                        <textarea
                          value={item.producto.nombre}
                          onChange={(e) => handleNombreChange(index, e.target.value)}
                          className="w-full min-w-[250px] px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-white"
                          rows={2}
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
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="SKU"
                        />
                      ) : (
                        <div className="text-sm text-gray-700 font-mono">
                          {item.producto.codigo_barra || item.producto.codigo || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editando ? (
                        <select
                          value={item.producto.categoria}
                          onChange={(e) => handleCategoriaChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Almacén">Almacén</option>
                          <option value="Bebidas">Bebidas</option>
                          <option value="Limpieza">Limpieza</option>
                          <option value="Librería">Librería</option>
                          <option value="Bazar">Bazar</option>
                          <option value="Otros">Otros</option>
                        </select>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-700">
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
                          className="w-20 px-3 py-2 border border-blue-300 rounded-lg text-sm font-bold text-gray-900 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="text-sm font-bold text-gray-900">{item.cantidad}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {editando ? (
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-400">$</span>
                          <input
                            type="text"
                            value={formatNumber(item.precio_unitario)}
                            onChange={(e) => handlePrecioChange(index, e.target.value)}
                            className="w-32 pl-6 pr-3 py-2 border border-blue-300 rounded-lg text-sm font-bold text-gray-900 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-gray-900">${formatNumber(item.precio_unitario)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-green-600">${formatNumber(item.subtotal)}</div>
                    </td>
                    {editando && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setItemToDelete(index)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          {/* Split Button */}
                          <div className="relative inline-block">
                            <button
                              onClick={() => openSplitModal(index, item)}
                              className={`p-2 rounded-lg transition-colors ${isPackSuspect(item.producto.nombre)
                                ? 'text-purple-600 bg-purple-50 hover:bg-purple-100 animate-pulse'
                                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                                }`}
                              title="Desglosar Pack (Split)"
                            >
                              <Scissors className="w-5 h-5" />
                              {isPackSuspect(item.producto.nombre) && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
            <tfoot className="bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-200">
              <tr>
                <td colSpan={editando ? 6 : 5} className="px-6 py-5 text-right text-sm font-bold text-gray-500 uppercase tracking-wider">
                  TOTAL DE LA COMPRA:
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="text-2xl font-bold text-green-600">${formatNumber(calcularTotal())}</div>
                </td>
                {editando && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden">
          <div className={`divide-y divide-gray-100 ${editando ? 'bg-blue-50/10' : ''}`}>
            <AnimatePresence mode="popLayout">
              {productos.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 ${editando ? 'bg-blue-50/20' : 'bg-white'}`}
                >
                  {editando ? (
                    <div className="space-y-3">
                      <textarea
                        value={item.producto.nombre}
                        onChange={(e) => handleNombreChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-white"
                        rows={2}
                        placeholder="Nombre del producto"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={item.producto.codigo_barra || item.producto.codigo || ''}
                          onChange={(e) => handleCodigoChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-gray-900"
                          placeholder="SKU"
                        />
                        <select
                          value={item.producto.categoria}
                          onChange={(e) => handleCategoriaChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs font-semibold text-gray-900"
                        >
                          <option value="Almacén">Almacén</option>
                          <option value="Bebidas">Bebidas</option>
                          <option value="Limpieza">Limpieza</option>
                          <option value="Librería">Librería</option>
                          <option value="Bazar">Bazar</option>
                          <option value="Otros">Otros</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 font-semibold uppercase mb-1 block">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => handleCantidadChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm font-bold text-gray-900 text-center"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-semibold uppercase mb-1 block">Precio Unit.</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-400">$</span>
                            <input
                              type="text"
                              value={formatNumber(item.precio_unitario)}
                              onChange={(e) => handlePrecioChange(index, e.target.value)}
                              className="w-full pl-6 pr-3 py-2 border border-blue-300 rounded-lg text-sm font-bold text-gray-900 text-right"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="text-sm font-bold text-green-600">
                          Total: ${formatNumber(item.subtotal)}
                        </div>
                        <div className="flex gap-2">
                          {/* Split Button Mobile */}
                          <button
                            onClick={() => openSplitModal(index, item)}
                            className={`p-2 rounded-lg transition-colors border ${isPackSuspect(item.producto.nombre)
                              ? 'text-purple-600 bg-purple-50 border-purple-200'
                              : 'text-gray-400 border-gray-200'
                              }`}
                          >
                            <Scissors className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(index)}
                            className="p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-1">{item.producto.nombre}</h3>
                          <div className="flex flex-wrap gap-2 mb-1">
                            <span className="px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              {item.producto.categoria}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {item.producto.codigo_barra || item.producto.codigo || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-end border-t border-gray-50 pt-2 mt-2">
                        <div className="text-xs text-gray-500">
                          {item.cantidad} x ${formatNumber(item.precio_unitario)}
                        </div>
                        <div className="text-base font-bold text-green-600">
                          ${formatNumber(item.subtotal)}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile Total */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center sticky bottom-0 z-10">
            <span className="text-sm font-bold text-gray-500 uppercase">Total:</span>
            <span className="text-xl font-bold text-green-600">${formatNumber(calcularTotal())}</span>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {/* Modal Split */}
      <Modal
        isOpen={!!splitItem}
        onClose={() => setSplitItem(null)}
        title="Desglosar Pack en Unidades"
      >
        {splitItem && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-bold flex items-center gap-2">
                <Package className="w-4 h-4" /> {splitItem.item.producto.nombre}
              </p>
              <p className="mt-1">
                Estás convirtiendo <strong>{splitItem.item.cantidad} packs</strong> de precio <strong>${formatNumber(splitItem.item.precio_unitario)}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidades por Pack
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    value={splitUnits}
                    onChange={(e) => setSplitUnits(parseInt(e.target.value) || 0)}
                    className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-lg"
                  />
                  <div className="text-gray-400 text-sm">unidades</div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Código de Barras (Unitario)
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={splitBarcode}
                    onChange={(e) => setSplitBarcode(e.target.value)}
                    placeholder="Escanear código del producto unitario..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Opcional. Deja vacío para mantener el actual.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vista Previa de Conversión</h4>

              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="text-gray-500 mb-1">Actual</div>
                  <div className="font-bold text-lg">{splitItem.item.cantidad}</div>
                  <div className="text-xs text-gray-500">Packs</div>
                </div>
                <div className="text-gray-300"><ArrowRight className="w-5 h-5" /></div>
                <div className="text-center">
                  <div className="text-green-600 mb-1 font-bold">Nuevo</div>
                  <div className="font-bold text-lg text-green-700">{splitItem.item.cantidad * splitUnits}</div>
                  <div className="text-xs text-green-700 font-bold">Unidades</div>
                </div>
              </div>

              <div className="border-t border-gray-200 my-3"></div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="text-gray-500 mb-1">Precio Pack</div>
                  <div className="font-bold">${formatNumber(splitItem.item.precio_unitario)}</div>
                </div>
                <div className="text-gray-300"><ArrowRight className="w-5 h-5" /></div>
                <div className="text-center">
                  <div className="text-green-600 mb-1 font-bold">Precio Unit.</div>
                  <div className="font-bold text-green-700">${formatNumber(splitItem.item.precio_unitario / splitUnits)}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSplitItem(null)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSplitSave}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl transition font-bold shadow-lg shadow-purple-600/20 flex justify-center items-center gap-2"
              >
                <Scissors className="w-5 h-5" />
                Confirmar Desglose
              </button>
            </div>
          </div>
        )}
      </Modal>

      <AnimatePresence>
        {itemToDelete !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center"
            >
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar producto?</h3>
              <p className="text-gray-500 mb-6">
                ¿Estás seguro de que deseas eliminar este producto de la compra? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition font-bold shadow-lg shadow-red-600/20"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
