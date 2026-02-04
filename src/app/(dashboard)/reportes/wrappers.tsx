import { Suspense } from 'react';
import ReportesStats from '@/components/reportes/ReportesStats';
import VentasPorVendedorChart from '@/components/reportes/VentasPorVendedorChart';
import RentabilidadChart from '@/components/reportes/RentabilidadChart';
import SalesList from '@/components/reportes/SalesList';
import MovimientosCajaTable from '@/components/reportes/MovimientosCajaTable';
import {
    getDashboardStats,
    getVentasPorVendedor,
    getRentabilidadReport,
    getMovimientosCajaReport,
    getRecentSales
} from './actions';

export async function StatsWrapper() {
    const stats = await getDashboardStats();
    return <ReportesStats stats={stats} />;
}

export async function VentasVendedorWrapper() {
    const data = await getVentasPorVendedor();
    return <VentasPorVendedorChart data={data} />;
}

export async function RecentSalesWrapper() {
    const data = await getRecentSales(200);
    return <SalesList data={data} />;
}

export async function RentabilidadWrapper() {
    const data = await getRentabilidadReport();
    return <RentabilidadChart data={data} />;
}

export async function MovimientosCajaWrapper() {
    const data = await getMovimientosCajaReport();
    return <MovimientosCajaTable data={data} />;
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse ${className}`}>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-100 rounded w-full"></div>
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
