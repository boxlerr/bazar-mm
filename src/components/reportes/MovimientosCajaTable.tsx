'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface MovimientosCajaTableProps {
    data: any[];
}

export default function MovimientosCajaTable({ data }: MovimientosCajaTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Últimos Movimientos de Caja</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        {data.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, data.length)} de {data.length}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft size={16} className="text-gray-600" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight size={16} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Concepto</th>
                            <th className="px-4 py-3">Usuario</th>
                            <th className="px-4 py-3 text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentData.map((mov) => (
                            <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-gray-600">
                                    {format(new Date(mov.created_at), "d MMM, HH:mm", { locale: es })}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        {mov.tipo === 'ingreso' ? (
                                            <ArrowDownLeft size={16} className="text-green-500" />
                                        ) : (
                                            <ArrowUpRight size={16} className="text-red-500" />
                                        )}
                                        {mov.concepto}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {mov.caja?.usuario?.nombre || 'Usuario'}
                                </td>
                                <td className={`px-4 py-3 text-right font-bold ${mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {mov.tipo === 'ingreso' ? '+' : '-'}${Number(mov.monto).toLocaleString('es-AR')}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                    No hay movimientos registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3 p-4">
                {currentData.map((mov) => (
                    <div key={mov.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 font-medium text-gray-900">
                                {mov.tipo === 'ingreso' ? (
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600 shrink-0">
                                        <ArrowDownLeft size={18} />
                                    </div>
                                ) : (
                                    <div className="p-2 bg-red-50 rounded-lg text-red-600 shrink-0">
                                        <ArrowUpRight size={18} />
                                    </div>
                                )}
                                <span className="text-sm">{mov.concepto}</span>
                            </div>
                            <span className={`font-bold text-lg whitespace-nowrap ${mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                {mov.tipo === 'ingreso' ? '+' : '-'}${Number(mov.monto).toLocaleString('es-AR')}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                                <User size={14} className="text-gray-400" />
                                <span>{mov.caja?.usuario?.nombre || 'Usuario'}</span>
                            </div>
                            <span>{format(new Date(mov.created_at), "d MMM, HH:mm", { locale: es })}</span>
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-100 rounded-xl">
                        No hay movimientos registrados
                    </div>
                )}
            </div>
        </div>
    );
}
