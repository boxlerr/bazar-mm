import { Metadata } from 'next';
import ReportesStats from '@/components/reportes/ReportesStats';
import SalesChart from '@/components/reportes/SalesChart';
import ReportesGenerator from '@/components/reportes/ReportesGenerator';
import VentasPorVendedorChart from '@/components/reportes/VentasPorVendedorChart';
import RentabilidadChart from '@/components/reportes/RentabilidadChart';
import MovimientosCajaTable from '@/components/reportes/MovimientosCajaTable';
import {
  getDashboardStats,
  getSalesChartData,
  getVentasPorVendedor,
  getRentabilidadReport,
  getMovimientosCajaReport
} from './actions';

export const metadata: Metadata = {
  title: 'Reportes',
};

// Forzar renderizado dinámico para tener datos frescos
export const dynamic = 'force-dynamic';

interface ReportesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const resolvedParams = await searchParams;
  const range = (resolvedParams.range as any) || '7d';

  // Fechas para filtros (por ahora usando el range del Sales Charts para todos aprox, o deafult)
  // Idealmente se pasa startDate/endDate a todos.
  // Por simplicidad, Actions ya manejan opcionalidad.

  const [stats, salesData, ventasVendedor, rentabilidad, movimientosCaja] = await Promise.all([
    getDashboardStats(),
    getSalesChartData(range),
    getVentasPorVendedor(),
    getRentabilidadReport(),
    getMovimientosCajaReport()
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Reportes</h1>
        <p className="text-gray-500 mt-2">Análisis de ventas y métricas de negocio</p>
      </div>

      <ReportesStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SalesChart data={salesData} currentRange={range} />
        </div>
        <div className="lg:col-span-1">
          <VentasPorVendedorChart data={ventasVendedor} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RentabilidadChart data={rentabilidad} />
        <MovimientosCajaTable data={movimientosCaja} />
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generador de Archivos</h2>
        <ReportesGenerator />
      </div>
    </div>
  );
}
