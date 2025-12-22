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

            <div className="relative h-64">
                {/* Background Grid */}
                <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none">
                    <div className="border-b border-gray-100 w-full h-0"></div>
                    <div className="border-b border-gray-100 w-full h-0"></div>
                    <div className="border-b border-gray-100 w-full h-0"></div>
                    <div className="border-b border-gray-100 w-full h-0"></div>
                    <div className="border-b border-gray-100 w-full h-0"></div>
                </div>

                <div className="absolute inset-0 flex items-end justify-around gap-2 px-4">
                    {chartData.map((item, index) => {
                        const heightTotal = (item.venta_total / maxVal) * 100;
                        const heightGanancia = (item.ganancia / maxVal) * 100;

                        return (
                            <div key={item.fecha} className="flex-1 flex flex-col items-center justify-end h-full group/bar max-w-[60px]">
                                <div className="relative w-full flex justify-center items-end h-full">
                                    {/* Barra Total Venta (Fondo) */}
                                    <div
                                        style={{ height: `${heightTotal}%` }}
                                        className="w-full bg-gray-100 rounded-t-md relative transition-all duration-500 hover:bg-gray-200"
                                    >
                                        {/* Barra Ganancia (Frente) */}
                                        <div
                                            style={{ height: `${(item.ganancia / item.venta_total) * 100}%` }}
                                            className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all duration-500 opacity-90"
                                        />

                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs p-2 rounded shadow-lg pointer-events-none z-20 w-max transition-opacity duration-200">
                                            <div className="font-bold mb-1">{item.fecha}</div>
                                            <div className="flex justify-between gap-4"><span>Venta:</span> <span className="font-mono">${item.venta_total.toLocaleString()}</span></div>
                                            <div className="flex justify-between gap-4 text-green-300"><span>Ganancia:</span> <span className="font-mono">${item.ganancia.toLocaleString()}</span></div>
                                            <div className="flex justify-between gap-4 text-gray-400 border-t border-gray-700 mt-1 pt-1"><span>Margen:</span> <span className="font-mono">{item.margen.toFixed(1)}%</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-[10px] text-gray-400 font-medium truncate w-full text-center">
                                    {item.fecha.split('-')[2]}/{item.fecha.split('-')[1]}
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
