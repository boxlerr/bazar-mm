import { Metadata } from 'next';
import { getSalesHistory } from '../actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SalesList from '@/components/reportes/SalesList';

export const metadata: Metadata = {
    title: 'Historial de Ventas | Bazar M&M',
    description: 'Historial de transacciones realizadas',
};

export const dynamic = 'force-dynamic';

export default async function HistorialVentasPage() {
    const sales = await getSalesHistory();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/ventas"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
                    <p className="text-gray-500 mt-1">Registro de todas las transacciones realizadas</p>
                </div>
            </div>

            <SalesList data={sales} />
        </div>
    );
}
