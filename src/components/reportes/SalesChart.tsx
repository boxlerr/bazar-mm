'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface SalesChartProps {
    data: {
        day: string;
        value: number;
        fullDate: string;
    }[];
    currentRange: string;
}

const RANGES = [
    { label: '7 Días', value: '7d', title: 'Ventas de la Semana' },
    { label: '30 Días', value: '30d', title: 'Ventas del Mes' },
    { label: '60 Días', value: '60d', title: 'Ventas últimos 60 días' },
    { label: '90 Días', value: '90d', title: 'Ventas Trimestrales' },
    { label: '1 Año', value: '12m', title: 'Ventas Anuales' },
];

export default function SalesChart({ data, currentRange }: SalesChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 100);
    const activeRange = RANGES.find(r => r.value === currentRange) || RANGES[0];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 group-hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <Link href="/ventas/historial" className="group flex items-center gap-3 cursor-pointer">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {activeRange.title}
                    </h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver historial
                    </span>
                </Link>

                <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                    {RANGES.map((range) => (
                        <Link
                            key={range.value}
                            href={`/reportes?range=${range.value}`}
                            scroll={false}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentRange === range.value
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {range.label}
                        </Link>
                    ))}
                </div>
            </div>

            <Link href="/ventas/historial" className="block cursor-pointer">
                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                    {data.map((item, index) => {
                        const heightPercentage = (item.value / maxValue) * 100;
                        return (
                            <div key={item.fullDate} className="flex-1 flex flex-col items-center gap-2 group/bar">
                                <div className="relative w-full flex justify-center items-end h-full">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercentage}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.02, ease: "easeOut" }}
                                        className={`w-full ${data.length > 30 ? 'max-w-none' : 'max-w-[40px]'} bg-blue-100 rounded-t-md group-hover/bar:bg-blue-300 transition-colors relative min-w-[4px]`}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            className="absolute -bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20"
                                        >
                                            <div className="font-bold">${item.value.toLocaleString()}</div>
                                            <div className="text-[10px] opacity-80">{item.fullDate}</div>
                                        </motion.div>
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-b-sm opacity-50"></div>
                                    </motion.div>
                                </div>
                                {(data.length < 15 || index % Math.ceil(data.length / 10) === 0) && (
                                    <span className="text-[10px] font-medium text-gray-500 truncate max-w-full">{item.day}</span>
                                )}
                            </div>
                        );
                    })}
                    {data.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No hay datos para este período
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}
