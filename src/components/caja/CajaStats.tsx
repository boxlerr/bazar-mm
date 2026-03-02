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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: stat.delay, ease: "easeOut" }}
                    className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                >
                    {/* Background Glow */}
                    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${stat.bg} opacity-50 blur-2xl group-hover:scale-110 transition-transform duration-500`} />

                    <div className="relative flex items-center justify-between mb-4">
                        <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm border border-white/60 ring-1 ring-black/5`}>
                            <stat.icon className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        {index === 3 && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm border ${estado.abierta
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {estado.abierta ? 'Abierta' : 'Cerrada'}
                            </span>
                        )}
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-500 tracking-wide">{stat.label}</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">
                            ${stat.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
