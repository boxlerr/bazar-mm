'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface MovimientosCajaTableProps {
    data: any[];
}

export default function MovimientosCajaTable({ data }: MovimientosCajaTableProps) {
    // Mostrar solo los últimos 10 movimientos si hay muchos
    const movimientos = data.slice(0, 10);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Últimos Movimientos de Caja</h3>
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
                        {movimientos.map((mov) => (
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
                                    {mov.tipo === 'ingreso' ? '+' : '-'}${Number(mov.monto).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {movimientos.length === 0 && (
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
