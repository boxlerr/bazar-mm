'use client';

import { useState, useMemo } from 'react';
import { Compra } from '@/types/compra';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    FileText,
    Calendar,
    DollarSign,
    Eye,
    MoreVertical,
    ArrowUpDown,
    Download
} from 'lucide-react';

interface TablaComprasProps {
    compras: any[]; // Usamos any por ahora para acomodar las relaciones que vienen de supabase
}

export default function TablaCompras({ compras }: TablaComprasProps) {
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 10;

    // Filtrado y Búsqueda
    const comprasFiltradas = useMemo(() => {
        return compras.filter((compra) => {
            const coincideBusqueda =
                (compra.proveedor?.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
                (compra.numero_orden?.toLowerCase() || '').includes(busqueda.toLowerCase());

            const coincideEstado =
                filtroEstado === 'todos' || compra.estado === filtroEstado;

            return coincideBusqueda && coincideEstado;
        });
    }, [compras, busqueda, filtroEstado]);

    // Paginación
    const totalPaginas = Math.ceil(comprasFiltradas.length / itemsPorPagina);
    const comprasPaginadas = comprasFiltradas.slice(
        (paginaActual - 1) * itemsPorPagina,
        paginaActual * itemsPorPagina
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-4">
            {/* Barra de Herramientas */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por proveedor o N° orden..."
                        className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            className="pl-10 w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="completada">Completada</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    N° Orden
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Proveedor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence mode='wait'>
                                {comprasPaginadas.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FileText className="w-12 h-12 mb-3 opacity-20" />
                                                <p className="text-lg font-medium text-gray-900">No se encontraron compras</p>
                                                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    comprasPaginadas.map((compra, index) => (
                                        <motion.tr
                                            key={compra.id}
                                            variants={item}
                                            initial="hidden"
                                            animate="show"
                                            exit="hidden"
                                            onClick={() => window.location.href = `/compras/${compra.id}`}
                                            className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                                        <FileText className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {compra.numero_orden || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {compra.proveedor?.nombre || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        {new Date(compra.created_at).toLocaleDateString('es-AR')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                    {compra.items?.length || 0} productos
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-gray-900 font-semibold">
                                                    <span className="text-xs text-gray-400">$</span>
                                                    {compra.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${compra.estado === 'completada'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : compra.estado === 'pendiente'
                                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${compra.estado === 'completada' ? 'bg-green-500' :
                                                        compra.estado === 'pendiente' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}></span>
                                                    {compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    {compra.pdf_url && (
                                                        <a
                                                            href={compra.pdf_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Ver PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <Link
                                                        href={`/compras/${compra.id}`}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Ver Detalle"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </div>
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
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <button
                            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                            disabled={paginaActual === 1}
                            className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all text-gray-500"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <button
                            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaActual === totalPaginas}
                            className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all text-gray-500"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
