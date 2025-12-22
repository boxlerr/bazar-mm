'use client';

import { motion } from 'framer-motion';

interface SalesChartProps {
    data: {
        day: string;
        value: number;
        fullDate: string;
    }[];
}

export default function SalesChart({ data }: SalesChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 100); // Evitar división por cero

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900">Ventas de la Semana</h3>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Ventas
                    </span>
                </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                {data.map((item, index) => {
                    const heightPercentage = (item.value / maxValue) * 100;
                    return (
                        <div key={item.fullDate} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex justify-center items-end h-full">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercentage}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                                    className="w-full max-w-[40px] bg-blue-100 rounded-t-md group-hover:bg-blue-200 transition-colors relative"
                                >
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10"
                                    >
                                        ${item.value.toLocaleString()}
                                    </motion.div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-b-sm opacity-50"></div>
                                </motion.div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">{item.day}</span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
