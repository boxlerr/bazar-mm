'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Package, AlertTriangle, Eye, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Producto } from '@/types/producto';
import { getDolarBlue, getDolarOficial, convertirPrecioADolares } from '@/services/dolarService';

interface TablaStockProps {
  productos: Producto[];
}

export default function TablaStock({ productos }: TablaStockProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [stockFiltro, setStockFiltro] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [dolarBlue, setDolarBlue] = useState<number>(0);
  const [dolarOficial, setDolarOficial] = useState<number>(0);
  const itemsPorPagina = 15;

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

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Precio Venta (ARS / USD)
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {productosPaginados.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Package className="w-12 h-12" />
                        <p className="text-gray-900 font-medium">No se encontraron productos</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  productosPaginados.map((producto, idx) => (
                    <motion.tr
                      key={producto.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                      onClick={() => window.location.href = `/stock/${producto.id}`}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-bold ${producto.stock_actual <= producto.stock_minimo
                                ? 'text-red-600'
                                : 'text-gray-900'
                                }`}>
                                {producto.stock_actual}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
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
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/stock/${producto.id}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
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
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
