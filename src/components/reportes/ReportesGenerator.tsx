'use client';

import { useState } from 'react';
import { FileText, Package, Users, CreditCard, Download } from 'lucide-react';
import ReportCard from './ReportCard';
import { getVentasReport, getStockReport, getClientesReport } from '@/app/(dashboard)/reportes/actions';
import { exportToPDF, exportToXLSX } from '@/app/(dashboard)/reportes/export';

export default function ReportesGenerator() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleGenerate = async (reportType: string) => {
        setLoading(reportType);
        try {
            const timestamp = new Date().toISOString().split('T')[0];

            switch (reportType) {
                case 'Reporte de Ventas':
                    const ventas = await getVentasReport();
                    if (ventas && ventas.length > 0) {
                        // Preparar datos planos para exportación
                        const data = ventas.map((v: any) => ({
                            Fecha: new Date(v.created_at).toLocaleDateString(),
                            Total: v.total,
                            MetodoPago: v.metodo_pago,
                            Estado: v.estado,
                            Items: v.venta_items?.length || 0
                        }));

                        await exportToPDF(data, `ventas_${timestamp}`, 'Reporte de Ventas', ['Fecha', 'Total', 'MetodoPago', 'Estado']);
                        // También exportar a Excel como ejemplo
                        // await exportToXLSX(data, `ventas_${timestamp}`);
                    } else {
                        alert('No hay datos de ventas para exportar.');
                    }
                    break;

                case 'Inventario y Stock':
                    const stock = await getStockReport();
                    if (stock && stock.length > 0) {
                        const data = stock.map((p: any) => ({
                            Codigo: p.codigo,
                            Nombre: p.nombre,
                            Categoria: p.categoria,
                            Stock: p.stock_actual,
                            Minimo: p.stock_minimo,
                            PrecioVenta: p.precio_venta
                        }));
                        await exportToXLSX(data, `stock_${timestamp}`);
                    } else {
                        alert('No hay datos de stock para exportar.');
                    }
                    break;

                case 'Clientes y Deudas':
                    const clientes = await getClientesReport();
                    if (clientes && clientes.length > 0) {
                        const data = clientes.map((c: any) => ({
                            Nombre: c.nombre,
                            DNI: c.dni,
                            Telefono: c.telefono,
                            Direccion: c.direccion
                        }));
                        await exportToXLSX(data, `clientes_${timestamp}`);
                    } else {
                        alert('No hay datos de clientes para exportar.');
                    }
                    break;

                default:
                    alert('Funcionalidad en desarrollo para este reporte.');
            }
        } catch (error) {
            console.error('Error generando reporte:', error);
            alert('Ocurrió un error al generar el reporte.');
        } finally {
            setLoading(null);
        }
    };

    const reports = [
        {
            title: 'Reporte de Ventas',
            description: 'Exportar PDF con detalle de ventas recientes.',
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: 'Inventario y Stock',
            description: 'Exportar Excel con estado actual del inventario.',
            icon: Package,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            title: 'Clientes y Deudas',
            description: 'Exportar Excel con listado de clientes.',
            icon: Users,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            title: 'Caja y Movimientos',
            description: 'Historial de cierres de caja (Próximamente).',
            icon: CreditCard,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
        },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Generar Reportes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reports.map((report, index) => (
                    <ReportCard
                        key={report.title}
                        {...report}
                        delay={0.4 + (index * 0.1)}
                        onGenerate={() => handleGenerate(report.title)}
                    />
                ))}
            </div>
            {loading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-900 font-medium">Generando {loading}...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
