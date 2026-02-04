'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Package, AlertTriangle, Eye, ChevronLeft, ChevronRight, DollarSign, Pencil, Trash2, Check, X, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { Producto } from '@/types/producto';
import { getDolarBlue, getDolarOficial, convertirPrecioADolares } from '@/services/dolarService';
import { createClient } from '@/lib/supabase/client';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { toast } from 'sonner';

interface TablaStockProps {
  productos: Producto[];
  onRefresh: () => void;
}

export default function TablaStock({ productos, onRefresh }: TablaStockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [stockFiltro, setStockFiltro] = useState('todos');

  // Obtener página actual de la URL o default a 1
  const paginaActual = Number(searchParams.get('page')) || 1;

  const [dolarBlue, setDolarBlue] = useState<number>(0);
  const [dolarOficial, setDolarOficial] = useState<number>(0);

  // Estados para edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ stock: number; precio: number }>({ stock: 0, precio: 0 });
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Bulk Edit State
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEdits, setBulkEdits] = useState<{ [key: string]: { stock: number | string; costo: number | string; margen: number | string; precio: number | string } }>({});
  const [savingBulk, setSavingBulk] = useState(false);

  // Estados para eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null);

  const itemsPorPagina = 15;

  // Función para cambiar de página actualizando la URL
  const setPaginaActual = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', nuevaPagina.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const [blue, oficial] = await Promise.all([
          getDolarBlue(),
          getDolarOficial()
        ]);
        setDolarBlue(blue.venta);
        setDolarOficial(oficial.venta);
      } catch (error) {
        console.error("Error fetching dollar rates:", error);
      }
    };
    fetchDolar();
  }, []);

  // Obtener categorías únicas
  const categorias = Array.from(new Set(productos.map(p => p.categoria)));

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo_barra?.toLowerCase().includes(busqueda.toLowerCase());

    const matchCategoria = categoriaFiltro === 'todos' || producto.categoria === categoriaFiltro;

    const matchStock =
      stockFiltro === 'todos' ||
      (stockFiltro === 'bajo' && producto.stock_actual <= producto.stock_minimo) ||
      (stockFiltro === 'normal' && producto.stock_actual > producto.stock_minimo);

    return matchBusqueda && matchCategoria && matchStock;
  });

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Almacén': 'bg-blue-100 text-blue-700 border-blue-200',
      'Bebidas': 'bg-purple-100 text-purple-700 border-purple-200',
      'Limpieza': 'bg-green-100 text-green-700 border-green-200',
      'Librería': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Bazar': 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const startEditing = (producto: Producto) => {
    setEditingId(producto.id);
    setEditValues({
      stock: producto.stock_actual,
      precio: producto.precio_venta
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({ stock: 0, precio: 0 });
  };

  const saveChanges = async (id: string) => {
    setLoadingAction(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('productos')
        .update({
          stock_actual: editValues.stock,
          precio_venta: editValues.precio
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Producto actualizado correctamente');
      setEditingId(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBulkChange = (id: string, field: 'stock' | 'costo' | 'margen' | 'precio', value: string) => {
    setBulkEdits(prev => {
      const current = prev[id] || {
        stock: productos.find(p => p.id === id)?.stock_actual || 0,
        costo: productos.find(p => p.id === id)?.precio_costo || 0,
        precio: productos.find(p => p.id === id)?.precio_venta || 0,
        margen: 0 // Will calc below
      };

      // Recalcular margen inicial si no existe
      if (!prev[id]) {
        const p = productos.find(p => p.id === id);
        if (p && p.precio_costo > 0) {
          current.margen = ((p.precio_venta / p.precio_costo) - 1) * 100;
        }
      }

      const changes = { ...current, [field]: value };

      // Si el valor es vacio, no recalculamos nada más para permitir borrar
      if (value === '') {
        return { ...prev, [id]: changes };
      }

      const numValue = Number(value);
      const invalidCost = typeof current.costo === 'string' || current.costo === 0;
      const invalidMargen = typeof current.margen === 'string';

      // Lógica de recálculo
      if (field === 'costo') {
        // Precio = Costo * (1 + Margen/100)
        // Solo recalculamos si hay un margen válido
        if (!invalidMargen) {
          changes.precio = numValue * (1 + (Number(current.margen) / 100));
        }
      } else if (field === 'margen') {
        // Precio = Costo * (1 + Margen/100)
        // Solo recalculamos si hay costo válido
        if (!invalidCost) {
          changes.precio = Number(current.costo) * (1 + (numValue / 100));
        }
      } else if (field === 'precio') {
        // Margen = ((Precio / Costo) - 1) * 100
        // Solo recalculamos si hay costo válido
        if (!invalidCost) {
          changes.margen = ((numValue / Number(current.costo)) - 1) * 100;
        }
      }

      return { ...prev, [id]: changes };
    });
  };

  const saveBulkChanges = async () => {
    setSavingBulk(true);
    try {
      const supabase = createClient();
      const updates = Object.entries(bulkEdits).map(async ([id, changes]) => {
        const { error } = await supabase
          .from('productos')
          .update({
            stock_actual: changes.stock,
            precio_costo: changes.costo,
            precio_venta: changes.precio
          })
          .eq('id', id);
        if (error) throw error;
      });

      await Promise.all(updates);
      toast.success('Cambios guardados correctamente');
      setIsBulkEditing(false);
      setBulkEdits({});
      onRefresh();
    } catch (error) {
      console.error('Error saving bulk edits:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setSavingBulk(false);
    }
  };

  const toggleBulkEdit = () => {
    if (isBulkEditing) {
      setIsBulkEditing(false);
      setBulkEdits({});
    } else {
      setIsBulkEditing(true);
      // Inicializar edicion para todos? No, mejor on-demand al escribir.
    }
  };

  const confirmDelete = (producto: Producto) => {
    setProductToDelete(producto);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setLoadingAction('deleting');
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', productToDelete.id);

      if (error) throw error;

      toast.success('Producto eliminado correctamente');
      setDeleteModalOpen(false);
      setProductToDelete(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar de búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, código o código de barras..."
              className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-3">
            {/* Filtro de Categoría */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-sm font-medium"
                value={categoriaFiltro}
                onChange={(e) => {
                  setCategoriaFiltro(e.target.value);
                  setPaginaActual(1);
                }}
              >
                <option value="todos">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Stock */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-sm font-medium"
                value={stockFiltro}
                onChange={(e) => {
                  setStockFiltro(e.target.value);
                  setPaginaActual(1);
                }}
              >
                <option value="todos">Todos</option>
                <option value="bajo">Stock Bajo</option>
                <option value="normal">Stock Normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            Mostrando <span className="font-semibold text-gray-900">{productosPaginados.length}</span> de{' '}
            <span className="font-semibold text-gray-900">{productosFiltrados.length}</span> productos
          </span>
          {stockFiltro === 'bajo' && productosFiltrados.length > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{productosFiltrados.length} productos con stock bajo</span>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Edit Toolbar */}
      {isBulkEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={toggleBulkEdit}
            disabled={savingBulk}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Cancelar Edición
          </button>
          <button
            onClick={saveBulkChanges}
            disabled={savingBulk || Object.keys(bulkEdits).length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-bold shadow-lg shadow-green-600/20 flex items-center gap-2"
          >
            {savingBulk ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios ({Object.keys(bulkEdits).length})
              </>
            )}
          </button>
        </div>
      )}
      {!isBulkEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={toggleBulkEdit}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition font-medium flex items-center gap-2 border border-blue-200"
          >
            <Pencil className="w-4 h-4" />
            Edición Múltiple
          </button>
        </div>
      )}


      {/* Tabla (Desktop) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Stock
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                  Costo
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Margen %
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                  Precio Venta (ARS)
                </th>
                {!isBulkEditing && (
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                )}
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Package className="w-12 h-12" />
                      <p className="text-gray-900 font-medium">No se encontraron productos</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                productosPaginados.map((producto, idx) => (
                  <tr
                    key={producto.id}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    onClick={() => {
                      if (editingId === producto.id || isBulkEditing) return;
                      router.push(`/stock/${producto.id}`);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">
                        {producto.codigo}
                      </div>
                      {producto.codigo_barra && (
                        <div className="text-xs text-gray-500 font-mono">
                          {producto.codigo_barra}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {producto.nombre}
                      </div>
                      {producto.descripcion && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {producto.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getCategoryColor(producto.categoria)}`}>
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {isBulkEditing ? (
                        <input
                          type="number"
                          value={bulkEdits[producto.id]?.stock ?? producto.stock_actual}
                          onChange={(e) => handleBulkChange(producto.id, 'stock', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className={`text-sm font-bold ${producto.stock_actual <= producto.stock_minimo ? 'text-red-600' : 'text-gray-900'}`}>
                          {producto.stock_actual}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {isBulkEditing ? (
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-gray-400 text-xs">$</span>
                          <input
                            type="number"
                            value={bulkEdits[producto.id]?.costo ?? producto.precio_costo}
                            onChange={(e) => handleBulkChange(producto.id, 'costo', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-24 pl-5 pr-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-600">
                          ${formatNumber(producto.precio_costo)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {isBulkEditing ? (
                        <div className="relative">
                          <input
                            type="number"
                            value={bulkEdits[producto.id]?.margen !== undefined ? bulkEdits[producto.id]?.margen : (producto.precio_costo > 0 ? Math.round(((producto.precio_venta / producto.precio_costo) - 1) * 100) : 0)}
                            onChange={(e) => handleBulkChange(producto.id, 'margen', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-20 pr-6 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right font-bold text-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-400 text-xs">%</span>
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-blue-600">
                          {producto.precio_costo > 0
                            ? Math.round(((producto.precio_venta / producto.precio_costo) - 1) * 100)
                            : 0
                          }%
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {isBulkEditing ? (
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-gray-400 text-xs">$</span>
                          <input
                            type="number"
                            value={bulkEdits[producto.id]?.precio !== undefined ? bulkEdits[producto.id]?.precio : Math.round(producto.precio_venta)}
                            onChange={(e) => handleBulkChange(producto.id, 'precio', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-28 pl-5 pr-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right font-bold text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-bold text-gray-900 mb-1">
                            ${formatNumber(producto.precio_venta)}
                          </div>
                          <div className="flex flex-col gap-0.5 items-end">
                            {dolarBlue > 0 && (
                              <div className="text-xs font-medium text-blue-600 flex items-center gap-1" title="Dólar Blue">
                                <span className="text-[10px] text-gray-400 font-normal">Blue:</span>
                                {formatNumber(producto.precio_venta / dolarBlue)} USD
                              </div>
                            )}
                            {dolarOficial > 0 && (
                              <div className="text-xs font-medium text-green-600 flex items-center gap-1" title="Dólar Oficial">
                                <span className="text-[10px] text-gray-400 font-normal">Oficial:</span>
                                {formatNumber(producto.precio_venta / dolarOficial)} USD
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </td>

                    {!isBulkEditing && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {producto.stock_actual <= producto.stock_minimo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            Bajo Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                            Normal
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {editingId === producto.id ? (
                          <>
                            <button
                              onClick={() => saveChanges(producto.id)}
                              disabled={loadingAction === producto.id}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Guardar"
                            >
                              {loadingAction === producto.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={!!loadingAction}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(producto)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Editar rápido"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/stock/${producto.id}`}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => confirmDelete(producto)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Página <span className="font-semibold text-gray-900">{paginaActual}</span> de{' '}
              <span className="font-semibold text-gray-900">{totalPaginas}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vista Móvil (Cards) */}
      <div className="md:hidden space-y-4">
        {productosPaginados.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Package className="w-12 h-12" />
              <p className="text-gray-900 font-medium">No se encontraron productos</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          </div>
        ) : (
          productosPaginados.map((producto) => (
            <div
              key={producto.id}
              onClick={() => {
                if (isBulkEditing) return;
                router.push(`/stock/${producto.id}`);
              }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs font-mono text-gray-500 mb-0.5">
                    {producto.codigo}
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-2">
                    {producto.nombre}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getCategoryColor(producto.categoria)}`}>
                  {producto.categoria}
                </span>
              </div>

              {/* Grid de Precio y Stock */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <span className="text-xs text-gray-500 block mb-1">Precio Venta</span>
                  {isBulkEditing ? (
                    <input
                      type="number"
                      value={bulkEdits[producto.id]?.precio !== undefined ? bulkEdits[producto.id]?.precio : Math.round(producto.precio_venta)}
                      onChange={(e) => handleBulkChange(producto.id, 'precio', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm font-bold"
                    />
                  ) : (
                    <div className="text-lg font-bold text-gray-900">
                      ${formatNumber(producto.precio_venta)}
                    </div>
                  )}
                  {!isBulkEditing && (
                    <div className="flex flex-col mt-1">
                      {dolarBlue > 0 && (
                        <div className="text-[10px] text-blue-600">
                          Blue: {formatNumber(producto.precio_venta / dolarBlue)} USD
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={`rounded-lg p-2.5 ${producto.stock_actual <= producto.stock_minimo ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                  <span className="text-xs text-gray-500 block mb-1">Stock Actual</span>
                  {isBulkEditing ? (
                    <input
                      type="number"
                      value={bulkEdits[producto.id]?.stock ?? producto.stock_actual}
                      onChange={(e) => handleBulkChange(producto.id, 'stock', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm font-bold text-center"
                    />
                  ) : (
                    <div className={`text-lg font-bold flex items-center gap-2 ${producto.stock_actual <= producto.stock_minimo ? 'text-red-700' : 'text-gray-900'}`}>
                      {producto.stock_actual}
                      {producto.stock_actual <= producto.stock_minimo && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                  {!isBulkEditing && (
                    <span className="text-[10px] text-gray-400">Min: {producto.stock_minimo}</span>
                  )}
                </div>
              </div>

              {/* Info secundaria expandible o fija */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex gap-4 text-xs text-gray-500">
                  <div>
                    <span className="block text-[10px] uppercase text-gray-400">Costo</span>
                    {isBulkEditing ? (
                      <input
                        type="number"
                        value={bulkEdits[producto.id]?.costo ?? producto.precio_costo}
                        onChange={(e) => handleBulkChange(producto.id, 'costo', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-16 bg-white border border-gray-200 rounded px-1 py-0.5 text-xs"
                      />
                    ) : (
                      <span className="font-medium">${formatNumber(producto.precio_costo)}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-gray-400">Margen</span>
                    {isBulkEditing ? (
                      <input
                        type="number"
                        value={bulkEdits[producto.id]?.margen !== undefined ? bulkEdits[producto.id]?.margen : (producto.precio_costo > 0 ? Math.round(((producto.precio_venta / producto.precio_costo) - 1) * 100) : 0)}
                        onChange={(e) => handleBulkChange(producto.id, 'margen', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-12 bg-white border border-gray-200 rounded px-1 py-0.5 text-xs"
                      />
                    ) : (
                      <span className="font-medium text-blue-600">
                        {producto.precio_costo > 0 ? Math.round(((producto.precio_venta / producto.precio_costo) - 1) * 100) : 0}%
                      </span>
                    )}
                  </div>
                </div>

                {!isBulkEditing && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(producto);
                      }}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(producto);
                      }}
                      className="p-2 text-red-600 bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Paginación Mobile */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-2 pb-6">
            <div className="text-xs text-gray-500">
              Página <span className="font-semibold text-gray-900">{paginaActual}</span> de{' '}
              <span className="font-semibold text-gray-900">{totalPaginas}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>


      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Producto"
        description={`¿Estás seguro que deseas eliminar el producto "${productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        loading={loadingAction === 'deleting'}
      />
    </div >
  );
}
