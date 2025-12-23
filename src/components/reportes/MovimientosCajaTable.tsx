'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight } from 'lucide-react';

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
            <div className="overflow-x-auto">
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
        </div>
    );
}
