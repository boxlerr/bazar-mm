'use client';

import { MovimientoCuentaCorriente } from '@/types/cliente';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function MovimientosTable({ movimientos }: { movimientos: MovimientoCuentaCorriente[] }) {
    if (movimientos.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No hay movimientos registrados en la cuenta corriente.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {movimientos.map((mov) => {
                            const isDebito = mov.tipo === 'debito'; // Débito = Aumenta deuda (Rojo)
                            const isCredito = mov.tipo === 'credito'; // Crédito = Disminuye deuda/Pago (Verde)

                            return (
                                <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {format(new Date(mov.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {mov.descripcion}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDebito ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {isDebito ? (
                                                <>
                                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                                    Compra / Cargo
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowDownLeft className="w-3 h-3 mr-1" />
                                                    Pago / Abono
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${isDebito ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        {isDebito ? '+' : '-'}${mov.monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
