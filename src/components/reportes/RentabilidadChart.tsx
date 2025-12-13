'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RentabilidadChartProps {
    data: {
        fecha: string;
        venta_total: number;
        ganancia: number;
        margen: number;
    }[];
}

export default function RentabilidadChart({ data }: RentabilidadChartProps) {
    // Tomamos los últimos 7-14 días o lo que venga para el gráfico, asumiendo viene ordenado desc
    // Lo invertimos para visualizar cronológicamente
    const chartData = [...data].reverse();
    const maxVal = Math.max(...chartData.map(d => d.venta_total), 100);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Rentabilidad Estimada
            </h3>

            <div className="h-64 flex items-end justify-between gap-1 sm:gap-2">
                {chartData.map((item, index) => {
                    const heightTotal = (item.venta_total / maxVal) * 100;
                    const heightGanancia = (item.ganancia / maxVal) * 100;

                    return (
                        <div key={item.fecha} className="flex-1 flex flex-col items-center gap-2 group/bar">
                            <div className="relative w-full flex justify-center items-end h-full">
                                {/* Barra Total Venta (Fondo) */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightTotal}%` }}
                                    className="w-full max-w-[30px] bg-gray-100 rounded-t-sm relative"
                                >
                                    {/* Barra Ganancia (Frente) */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(item.ganancia / item.venta_total) * 100}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="absolute bottom-0 left-0 right-0 bg-green-500/80 rounded-t-sm"
                                    />

                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs p-2 rounded pointer-events-none z-10 w-max">
                                        <div className="font-bold">{item.fecha}</div>
                                        <div>Venta: ${item.venta_total.toLocaleString()}</div>
                                        <div className="text-green-300">Ganancia: ${item.ganancia.toLocaleString()}</div>
                                        <div className="text-gray-400">Margen: {item.margen.toFixed(1)}%</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
                {chartData.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No hay datos para calcular rentabilidad
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-4 gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                    <span>Venta Total</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span>Ganancia Estimada</span>
                </div>
            </div>
        </div>
    );
}
