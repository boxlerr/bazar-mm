'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { CajaMovimiento } from '@/types';

interface MovimientosListProps {
    movimientos: CajaMovimiento[];
}

export default function MovimientosList({ movimientos }: MovimientosListProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
            <div className="p-4 md:p-6 border-b border-gray-100 text-center md:text-left">
                <h3 className="text-lg font-bold text-gray-900">Movimientos Recientes</h3>
            </div>

            {movimientos.length === 0 ? (
                <div className="p-16 text-center text-gray-500 bg-slate-50/30">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-5"
                    >
                        <Clock className="w-8 h-8 text-slate-300" />
                    </motion.div>
                    <p className="text-lg font-semibold text-slate-700">No hay movimientos registrados</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Los ingresos y egresos de esta sesión aparecerán aquí.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    {/* Desktop Table View */}
                    <table className="hidden md:table w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {movimientos.map((mov, index) => (
                                <motion.tr
                                    key={mov.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * index }}
                                    className="hover:bg-slate-50/80 transition-all duration-200 group"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border ${mov.tipo === 'INGRESO'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                                : 'bg-rose-50 text-rose-700 border-rose-200/60'
                                            }`}>
                                            {mov.tipo === 'INGRESO' ? (
                                                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                                            ) : (
                                                <ArrowDownLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                                            )}
                                            {mov.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                                        {mov.descripcion}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                        {mov.usuario}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {mov.fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-extrabold text-right tracking-tight ${mov.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                        {mov.tipo === 'INGRESO' ? '+' : '-'}${mov.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {movimientos.map((mov, index) => (
                            <motion.div
                                key={mov.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${mov.tipo === 'INGRESO'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {mov.tipo === 'INGRESO' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                        {mov.tipo}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {mov.fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="flex-1 pr-4">
                                        <p className="text-sm font-bold text-gray-900 mb-0.5 line-clamp-1">
                                            {mov.descripcion || 'Sin descripción'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {mov.usuario}
                                        </p>
                                    </div>
                                    <span className={`text-lg font-bold ${mov.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'}`}>
                                        {mov.tipo === 'INGRESO' ? '+' : '-'}${mov.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
