'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertTriangle } from 'lucide-react';

interface ReportesStatsProps {
    stats: {
        ventasMes: number;
        clientesNuevos: number;
        alertasStock: number;
    };
}

export default function ReportesStats({ stats }: ReportesStatsProps) {
    const statItems = [
        {
            label: 'Ventas del Mes',
            value: `$${stats.ventasMes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
            change: 'Actualizado hoy',
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-100',
            trend: 'up',
            delay: 0,
            href: '/ventas/historial'
        },
        {
            label: 'Clientes Nuevos',
            value: stats.clientesNuevos.toString(),
            change: 'Este mes',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            trend: 'up',
            delay: 0.1,
            href: '/clientes'
        },
        {
            label: 'Alertas de Stock',
            value: stats.alertasStock.toString(),
            change: stats.alertasStock > 0 ? 'Requieren atención' : 'Todo en orden',
            icon: AlertTriangle,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            trend: stats.alertasStock > 0 ? 'down' : 'neutral',
            delay: 0.2,
            href: '/stock?filter=low_stock'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statItems.map((stat) => (
                <Link key={stat.label} href={stat.href} className="block">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: stat.delay }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow h-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-800' :
                                stat.trend === 'down' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}
