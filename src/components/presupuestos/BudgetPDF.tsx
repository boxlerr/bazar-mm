'use client';

import { useEffect, useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Presupuesto } from '@/types/presupuesto';
import { X, Printer, Download, FileText, Edit2, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateBudgetObservation } from '@/app/(dashboard)/presupuestos/actions';
import { toast } from 'sonner';

interface BudgetPDFProps {
    budget: Presupuesto | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function BudgetPDF({ budget, isOpen, onClose }: BudgetPDFProps) {
    const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
    const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditingObs, setIsEditingObs] = useState(false);
    const [obs, setObs] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const generatePDF = useCallback((currentObs?: string) => {
        if (!budget) return;
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('PRESUPUESTO', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Bazar M&M', 105, 30, { align: 'center' });

            // Info Presupuesto
            doc.setFontSize(10);
            const nro = budget.nro_presupuesto || 0;
            const fecha = budget.created_at ? new Date(budget.created_at).toLocaleDateString() : 'N/A';

            doc.text(`N° Presupuesto: ${nro}`, 14, 45);
            doc.text(`Fecha: ${fecha}`, 14, 50);
            // doc.text(`Válido por: 7 días`, 14, 55); // Saca lo de los 7 dias

            // Cliente info
            doc.text('Cliente:', 130, 45);
            doc.setFont('helvetica', 'bold');
            doc.text(budget.clientes?.nombre || 'Consumidor Final', 130, 50);
            doc.setFont('helvetica', 'normal');

            // Table
            const tableColumn = ["Producto", "Cant.", "Precio Unit.", "Subtotal"];
            const tableRows: any[] = [];

            budget.presupuesto_items?.forEach(item => {
                const itemSubtotal = item.subtotal ?? (item.cantidad * item.precio_unitario);
                const row = [
                    item.nombre || item.productos?.nombre || 'Producto',
                    item.cantidad,
                    `$${(item.precio_unitario || 0).toLocaleString()}`,
                    `$${(itemSubtotal || 0).toLocaleString()}`
                ];
                tableRows.push(row);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 65,
                theme: 'grid',
                headStyles: { fillColor: [66, 66, 66], halign: 'center' },
                styles: { fontSize: 10 },
                columnStyles: {
                    1: { halign: 'center' },
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                }
            });

            const finalY = (doc as any).lastAutoTable.finalY || 100;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const rightAlignX = 196;

            const subtotal = budget.subtotal || 0;
            const descuento = budget.descuento || 0;
            const total = budget.total || 0;

            // Calcular % de descuento
            const discountPercentage = subtotal > 0
                ? Math.round((descuento / subtotal) * 100)
                : 0;

            doc.text(`Subtotal: $${subtotal.toLocaleString()}`, rightAlignX, finalY + 10, { align: 'right' });
            if (descuento > 0) {
                doc.text(`Descuento (${discountPercentage}%): -$${descuento.toLocaleString()}`, rightAlignX, finalY + 15, { align: 'right' });
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`TOTAL: $${total.toLocaleString()}`, rightAlignX, finalY + 25, { align: 'right' });

            const observationToShow = currentObs !== undefined ? currentObs : (budget.observaciones || '');
            if (observationToShow) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.text('Observaciones:', 14, finalY + 10);
                doc.setFont('helvetica', 'normal');
                doc.text(observationToShow, 14, finalY + 15, { maxWidth: 100 });
            }

            // Footer
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text('Este documento no es válido como factura. Los precios están sujetos a cambios sin previo aviso.', 105, 285, { align: 'center' });

            setPdfDoc(doc);
            setPdfDataUri(doc.output('datauristring'));
        } catch (err: any) {
            console.error('Error generating PDF:', err);
            setError(err.message || 'Error desconocido al generar PDF');
        }
    }, [budget]);

    useEffect(() => {
        if (isOpen && budget) {
            setObs(budget.observaciones || '');
            generatePDF();
        } else {
            setPdfDataUri(null);
            setPdfDoc(null);
            setError(null);
            setIsEditingObs(false);
        }
    }, [isOpen, budget, generatePDF]);

    const handleSaveObservation = async () => {
        if (!budget) return;
        setIsSaving(true);
        try {
            const result = await updateBudgetObservation(budget.id, obs);
            if (result.success) {
                toast.success('Observación actualizada');
                setIsEditingObs(false);
                generatePDF(obs); // Regenerate with new obs
            } else {
                toast.error('Error al guardar: ' + result.error);
            }
        } catch (error) {
            toast.error('Error de red al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = () => {
        if (pdfDoc && budget) {
            pdfDoc.save(`presupuesto-${budget.nro_presupuesto}.pdf`);
        }
    };

    const handlePrint = () => {
        if (pdfDoc) {
            pdfDoc.autoPrint();
            window.open(pdfDoc.output('bloburl'), '_blank');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="font-bold text-gray-900">Vista Previa Presupuesto</h3>
                        <p className="text-xs text-gray-500">#{budget?.nro_presupuesto || '---'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            disabled={!pdfDataUri}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!pdfDataUri}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Descargar
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors active:scale-95 ml-2">
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* PDF Viewer */}
                    <div className="flex-1 bg-neutral-800 flex items-center justify-center relative bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]">
                        {error ? (
                            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
                                <div className="text-red-500 mb-4 font-bold">⚠️ Error al cargar la vista previa</div>
                                <p className="text-gray-600 text-sm mb-6">{error}</p>
                                <button onClick={() => generatePDF()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    Reintentar
                                </button>
                            </div>
                        ) : !pdfDataUri ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                <p className="text-sm text-gray-400 font-medium">Generando vista previa...</p>
                            </div>
                        ) : (
                            <iframe
                                src={pdfDataUri}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                            />
                        )}
                    </div>

                    {/* Side Panel for Editing */}
                    <div className="w-80 border-l bg-gray-50 flex flex-col">
                        <div className="p-4 border-b bg-white">
                            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm mb-1">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Edición de Observación
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Aparece en el PDF</p>
                        </div>

                        <div className="p-4 flex-1 flex flex-col gap-4">
                            <div className="bg-white rounded-xl border p-4 shadow-sm flex-1 flex flex-col">
                                <textarea
                                    value={obs}
                                    onChange={(e) => setObs(e.target.value)}
                                    className="flex-1 w-full resize-none text-sm text-gray-700 outline-none placeholder:text-gray-300"
                                    placeholder="Escribe aquí las observaciones que saldrán en el presupuesto..."
                                />
                            </div>

                            <button
                                onClick={handleSaveObservation}
                                disabled={isSaving || obs === budget?.observaciones}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg",
                                    isSaving || obs === budget?.observaciones
                                        ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                                        : "bg-green-600 text-white hover:bg-green-700 shadow-green-500/20 active:scale-[0.98]"
                                )}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Guardar y Actualizar PDF
                            </button>

                            {obs !== budget?.observaciones && !isSaving && (
                                <p className="text-[10px] text-amber-600 font-bold text-center">
                                    ⚠️ Tienes cambios sin guardar
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-blue-50/50 border-t">
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-gray-500">Descuento aplicado:</span>
                                <span className="font-bold text-green-600">
                                    {budget && budget.subtotal > 0
                                        ? Math.round((budget.descuento / budget.subtotal) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Total presupuesto:</span>
                                <span className="font-bold text-blue-600 text-sm">
                                    ${budget?.total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
