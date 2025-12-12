import { Metadata } from 'next';
import ReportesStats from '@/components/reportes/ReportesStats';
import SalesChart from '@/components/reportes/SalesChart';
import ReportesGenerator from '@/components/reportes/ReportesGenerator';
import { getDashboardStats, getSalesChartData } from './actions';

export const metadata: Metadata = {
  title: 'Reportes | Bazar M&M',
  description: 'Panel de reportes y exportaciones',
};

// Forzar renderizado dinámico para tener datos frescos
export const dynamic = 'force-dynamic';

interface ReportesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const resolvedParams = await searchParams;
  const range = (resolvedParams.range as any) || '7d';

  const [stats, salesData] = await Promise.all([
    getDashboardStats(),
    getSalesChartData(range)
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Reportes</h1>
        <p className="text-gray-500 mt-2">Análisis de ventas y generación de informes</p>
      </div>

      <ReportesStats stats={stats} />

      <SalesChart data={salesData} currentRange={range} />

      <ReportesGenerator />
    </div>
  );
}
