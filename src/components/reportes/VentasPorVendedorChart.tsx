'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface VentasPorVendedorChartProps {
    data: {
        usuario: string;
        total_ventas: number;
        cantidad_tickets: number;
    }[];
}

export default function VentasPorVendedorChart({ data }: VentasPorVendedorChartProps) {
    const maxVal = Math.max(...data.map(d => d.total_ventas), 1);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-orange-500" />
                Ventas por Vendedor
            </h3>

            <div className="space-y-4">
                {data.map((item, idx) => (
                    <div key={item.usuario} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{item.usuario}</span>
                            <span className="text-gray-900 font-bold">${item.total_ventas.toLocaleString()}</span>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.total_ventas / maxVal) * 100}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                            />
                        </div>
                        <div className="text-xs text-gray-400 text-right">{item.cantidad_tickets} ventas</div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center text-gray-400 py-4">No hay datos disponibles</div>
                )}
            </div>
        </div>
    );
}
