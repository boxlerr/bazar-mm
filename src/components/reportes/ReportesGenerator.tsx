'use client';

import { useState } from 'react';
import { FileText, Package, Users, CreditCard, Download } from 'lucide-react';
import ReportCard from './ReportCard';
import DateRangeModal from './DateRangeModal';
import { getVentasReport, getStockReport, getClientesReport, getMovimientosCajaReport, getCajasReport } from '@/app/(dashboard)/reportes/actions';
import { exportToPDF, exportToXLSX, exportClientsToXLSX, exportStockToXLSX, exportCajaToXLSX, exportCajasToXLSX } from '@/app/(dashboard)/reportes/export';

export default function ReportesGenerator() {
    const [loading, setLoading] = useState<string | null>(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    const handleGenerate = async (reportType: string) => {
        if (reportType === 'Reporte de Ventas') {
            setSelectedReport(reportType);
            setShowDateModal(true);
            return;
        }
        await processGenerate(reportType);
    };

    const handleDateGenerate = async (startDate: Date | null, endDate: Date | null) => {
        if (selectedReport) {
            await processGenerate(selectedReport, startDate, endDate);
        }
    };

    const processGenerate = async (reportType: string, startDate?: Date | null, endDate?: Date | null) => {
        setLoading(reportType);
        try {
            const timestamp = new Date().toISOString().split('T')[0];

            switch (reportType) {
                case 'Reporte de Ventas':
                    const ventas = await getVentasReport(startDate || undefined, endDate || undefined);
                    if (ventas && ventas.length > 0) {
                        // Preparar datos planos para exportación con formato mejorado
                        const data = ventas.map((v: any) => ({
                            Fecha: new Date(v.created_at).toLocaleDateString() + ' ' + new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            Cliente: v.cliente?.nombre || 'Consumidor Final',
                            Vendedor: v.usuario?.nombre || 'Desconocido',
                            MetodoPago: v.metodo_pago?.toUpperCase(),
                            Estado: v.estado?.toUpperCase(),
                            Items: v.venta_items?.length || 0,
                            Total: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v.total)
                        }));

                        await exportToPDF(
                            data,
                            `ventas_${timestamp}`,
                            'Reporte de Ventas',
                            ['Fecha', 'Cliente', 'Vendedor', 'MetodoPago', 'Estado', 'Items', 'Total']
                        );
                    } else {
                        alert('No hay datos de ventas para exportar en el rango seleccionado.');
                    }
                    break;

                case 'Inventario y Stock':
                    const stock = await getStockReport();
                    if (stock && stock.length > 0) {
                        await exportStockToXLSX(stock);
                    } else {
                        alert('No hay datos de stock para exportar.');
                    }
                    break;

                case 'Clientes y Deudas':
                    const clientes = await getClientesReport();
                    if (clientes && clientes.length > 0) {
                        await exportClientsToXLSX(clientes);
                    } else {
                        alert('No hay datos de clientes para exportar.');
                    }
                    break;

                case 'Caja y Movimientos':
                    // Intentamos obtener ambos reportes: Cierres y Movimientos
                    const cajas = await getCajasReport(startDate || undefined, endDate || undefined);
                    const movimientos = await getMovimientosCajaReport(startDate || undefined, endDate || undefined);

                    if ((cajas && cajas.length > 0) || (movimientos && movimientos.length > 0)) {
                        if (cajas && cajas.length > 0) {
                            await exportCajasToXLSX(cajas);
                        } else if (movimientos && movimientos.length > 0) {
                            await exportCajaToXLSX(movimientos);
                        }
                    } else {
                        alert('No hay datos de caja para exportar.');
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

            <DateRangeModal
                isOpen={showDateModal}
                onClose={() => setShowDateModal(false)}
                onGenerate={handleDateGenerate}
                title={`Filtrar ${selectedReport}`}
            />
        </div>
    );
}
