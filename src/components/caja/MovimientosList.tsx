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
                <div className="p-12 text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No hay movimientos registrados en esta sesión</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    {/* Desktop Table View */}
                    <table className="hidden md:table w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {movimientos.map((mov, index) => (
                                <motion.tr
                                    key={mov.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${mov.tipo === 'INGRESO'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {mov.tipo === 'INGRESO' ? (
                                                <ArrowUpRight className="w-3 h-3" />
                                            ) : (
                                                <ArrowDownLeft className="w-3 h-3" />
                                            )}
                                            {mov.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                        {mov.descripcion}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {mov.usuario}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {mov.fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold text-right ${mov.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
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
