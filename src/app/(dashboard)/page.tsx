import { Suspense } from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    Users,
    Package,
    ArrowRight,
    Plus,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import ReportesStats from '@/components/reportes/ReportesStats';
import SalesChart from '@/components/reportes/SalesChart';
import { getDashboardStats, getSalesChartData } from './reportes/actions';

// Dashboard Home Page (Ruta: /)

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    const salesData = await getSalesChartData('7d'); // Default to 7 days overview

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Cabecera de Bienvenida */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold mb-2">¡Hola! Bienvenido de nuevo 👋</h1>
                    <p className="text-blue-100 text-lg">Aquí tienes el resumen de tu negocio hoy.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/ventas/nueva"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
                    >
                        <ShoppingCart size={20} />
                        Nueva Venta
                    </Link>
                </div>
            </div>

            {/* Accesos Rápidos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/ventas/nueva" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
                    <div className="bg-green-50 p-3 rounded-full group-hover:bg-green-100 transition-colors">
                        <Plus className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-700">Registrar Venta</span>
                </Link>
                <Link href="/clientes" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
                    <div className="bg-blue-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">Clientes</span>
                </Link>
                <Link href="/stock" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
                    <div className="bg-purple-50 p-3 rounded-full group-hover:bg-purple-100 transition-colors">
                        <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-700">Stock</span>
                </Link>
                <Link href="/reportes" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
                    <div className="bg-orange-50 p-3 rounded-full group-hover:bg-orange-100 transition-colors">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="font-medium text-gray-700">Reportes</span>
                </Link>
            </div>

            {/* Estadísticas Principales */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Métricas del Mes</h2>
                <ReportesStats stats={stats} />
            </div>

            {/* Gráfico y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Tendencia de Ventas (7 días)</h2>
                        <Link href="/reportes" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                            Ver reporte completo <ArrowRight size={16} />
                        </Link>
                    </div>
                    <SalesChart data={salesData} currentRange="7d" />
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Estado del Sistema</h2>

                    {/* Tarjeta de Stock Bajo */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Alertas de Stock</h3>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-red-600">{stats.alertasStock}</span>
                                    <span className="text-sm text-gray-500">productos bajos</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Productos que requieren reposición inmediata.
                                </p>
                                <Link
                                    href="/stock?filter=low_stock"
                                    className="mt-4 block w-full py-2 text-center border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                >
                                    Ver productos
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Otra tarjeta informativa si fuera necesario */}
                </div>
            </div>
        </div>
    );
}
