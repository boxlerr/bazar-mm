'use client';

import { useEffect, useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Presupuesto } from '@/types/presupuesto';
import { X, Printer, Download, FileText, Edit2, Save, Loader2, Info } from 'lucide-react';
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
        }
    }, [isOpen, budget, generatePDF]);

    const handleSaveObservation = async () => {
        if (!budget) return;
        setIsSaving(true);
        try {
            const result = await updateBudgetObservation(budget.id, obs);
            if (result.success) {
                toast.success('Observación actualizada');
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
            const blobUrl = pdfDoc.output('bloburl');
            window.open(blobUrl, '_blank');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-md" onClick={onClose}>
            <div
                className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-6xl h-full sm:h-[95vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-2 rounded-lg hidden sm:block">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-sm sm:text-base tracking-tight leading-none mb-1">Vista Previa Presupuesto</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compumundo • #{budget?.nro_presupuesto || '---'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={handlePrint}
                            disabled={!pdfDataUri}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!pdfDataUri}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 font-black text-[10px] sm:text-xs uppercase tracking-widest active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Descargar</span>
                            <span className="sm:hidden">PDF</span>
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-all active:scale-95 ml-1 text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                    {/* PDF Viewer Section */}
                    <div className="flex-1 bg-neutral-900/95 flex items-center justify-center relative overflow-hidden group">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

                        {error ? (
                            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center animate-in zoom-in duration-300 mx-4">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Info className="w-8 h-8" />
                                </div>
                                <h4 className="text-gray-900 font-black text-lg mb-2">Error de Generación</h4>
                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{error}</p>
                                <button
                                    onClick={() => generatePDF()}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all"
                                >
                                    Reintentar Carga
                                </button>
                            </div>
                        ) : !pdfDataUri ? (
                            <div className="flex flex-col items-center gap-4 animate-pulse">
                                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-lg" />
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">Renderizando presupuesto...</p>
                            </div>
                        ) : (
                            <iframe
                                src={pdfDataUri}
                                className="w-full h-full border-0 sm:p-4 lg:p-8"
                                title="PDF Preview"
                            />
                        )}

                        {/* Mobile Floating Print Button */}
                        <div className="absolute bottom-4 right-4 sm:hidden">
                            <button
                                onClick={handlePrint}
                                className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl shadow-blue-500/40 active:scale-90 transition-all"
                            >
                                <Printer className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Editor Panel - Moves to bottom on mobile, side on desktop */}
                    <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-gray-50 flex flex-col h-auto lg:h-full max-h-[40vh] lg:max-h-none overflow-hidden shrink-0 shadow-2xl z-20">
                        <div className="p-4 border-b bg-white flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-gray-900 font-black text-[10px] uppercase tracking-widest mb-0.5">
                                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                    Editor Rápido
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Impacta en el documento PDF</p>
                            </div>

                            {/* Mobile expansion indicator/hint */}
                            <div className="lg:hidden">
                                <FileText className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex-1 flex flex-col min-h-[120px] transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Observaciones Públicas</label>
                                <textarea
                                    value={obs}
                                    onChange={(e) => setObs(e.target.value)}
                                    className="flex-1 w-full resize-none text-xs sm:text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent leading-relaxed"
                                    placeholder="Escribe notas, plazos de entrega o formas de pago que deben figurar en el PDF..."
                                />
                            </div>

                            <button
                                onClick={handleSaveObservation}
                                disabled={isSaving || obs === budget?.observaciones}
                                className={cn(
                                    "w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    isSaving || obs === budget?.observaciones
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-900 text-white hover:bg-black shadow-xl shadow-gray-200 active:scale-[0.98]"
                                )}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isSaving ? 'Guardando...' : 'Aplicar al PDF'}
                            </button>

                            {obs !== budget?.observaciones && !isSaving && (
                                <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest text-center animate-pulse">
                                    ⚠️ Cambios pendientes de aplicación
                                </p>
                            )}
                        </div>

                        {/* Summary/Stats area in side panel */}
                        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white mt-auto">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">
                                <span>Resumen del Documento</span>
                                <Info className="w-3 h-3" />
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[9px] opacity-60 font-bold uppercase tracking-tighter">Total Final</div>
                                    <div className="text-xl font-black leading-none">${budget?.total.toLocaleString()}</div>
                                </div>
                                {budget && budget.descuento > 0 && (
                                    <div className="text-right">
                                        <div className="text-[9px] opacity-60 font-bold uppercase tracking-tighter">Bonificación</div>
                                        <div className="text-sm font-black text-green-300">-{Math.round((budget.descuento / budget.subtotal) * 100)}%</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
