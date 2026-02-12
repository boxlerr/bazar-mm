import { Metadata } from 'next';
import { Suspense } from 'react';
import ReportesGenerator from '@/components/reportes/ReportesGenerator';
import {
  StatsWrapper,
  VentasVendedorWrapper,
  RecentSalesWrapper,
  RentabilidadWrapper,
  MovimientosCajaWrapper,
  SkeletonStats,
  SkeletonCard
} from './wrappers';

export const metadata: Metadata = {
  title: 'Reportes',
};

// Forzar renderizado dinámico para tener datos frescos
export const dynamic = 'force-dynamic';

export default function ReportesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Reportes</h1>
        <p className="text-gray-500 mt-2">Análisis de ventas y métricas de negocio</p>
      </div>

      <Suspense fallback={<SkeletonStats />}>
        <StatsWrapper />
      </Suspense>

      <div className="grid grid-cols-1 gap-6">
        <div className="w-full space-y-6">
          <Suspense fallback={<SkeletonCard className="h-96" />}>
            <VentasVendedorWrapper />
          </Suspense>
          <Suspense fallback={<SkeletonCard className="h-96" />}>
            <RecentSalesWrapper />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<SkeletonCard className="h-80" />}>
          <RentabilidadWrapper />
        </Suspense>
        <Suspense fallback={<SkeletonCard className="h-80" />}>
          <MovimientosCajaWrapper />
        </Suspense>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generador de Archivos</h2>
        <ReportesGenerator />
      </div>
    </div>
  );
}
