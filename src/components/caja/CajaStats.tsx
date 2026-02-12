'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { CajaEstado } from '@/types';

interface CajaStatsProps {
    estado: CajaEstado;
}

export default function CajaStats({ estado }: CajaStatsProps) {
    const stats = [
        {
            label: 'Saldo Inicial',
            value: estado.saldoInicial,
            icon: Wallet,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            delay: 0,
        },
        {
            label: 'Ingresos',
            value: estado.totalIngresos,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-100',
            delay: 0.1,
        },
        {
            label: 'Egresos',
            value: estado.totalEgresos,
            icon: TrendingDown,
            color: 'text-red-600',
            bg: 'bg-red-100',
            delay: 0.2,
        },
        {
            label: 'Saldo Actual',
            value: estado.saldoActual,
            icon: DollarSign,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            delay: 0.3,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: stat.delay }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        {index === 3 && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                {estado.abierta ? 'Abierta' : 'Cerrada'}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            ${stat.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
