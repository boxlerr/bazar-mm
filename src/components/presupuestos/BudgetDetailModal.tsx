'use client';

import React, { useState } from 'react';
import { Presupuesto } from '@/types/presupuesto';
import { X, User, Calendar, FileText, Package, Save, Loader2, Edit2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateBudgetObservation } from '@/app/(dashboard)/presupuestos/actions';
import { toast } from 'sonner';

interface BudgetDetailModalProps {
    budget: Presupuesto;
    isOpen: boolean;
    onClose: () => void;
}

export default function BudgetDetailModal({ budget, isOpen, onClose }: BudgetDetailModalProps) {
    const [isEditingObs, setIsEditingObs] = useState(false);
    const [obs, setObs] = useState(budget.observaciones || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const statusConfig = {
        pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: '⏳ Pendiente' },
        convertido: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '✅ Convertido' },
        cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: '❌ Cancelado' }
    };

    const status = statusConfig[budget.estado] || statusConfig.pendiente;

    // Calcular % de descuento
    const discountPercentage = budget.subtotal > 0
        ? Math.round((budget.descuento / budget.subtotal) * 100)
        : 0;

    const handleSaveObservation = async () => {
        setIsSaving(true);
        try {
            const result = await updateBudgetObservation(budget.id, obs);
            if (result.success) {
                toast.success('Observación actualizada');
                setIsEditingObs(false);
            } else {
                toast.error('Error al guardar: ' + result.error);
            }
        } catch (error) {
            toast.error('Error de red al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <div className="bg-blue-600 text-white px-3 py-0.5 rounded-full text-xs font-bold">
                                    #{budget.nro_presupuesto}
                                </div>
                                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold", status.bg, status.text)}>
                                    {status.label}
                                </span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Detalle del Presupuesto</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-full transition-colors active:scale-90 flex-shrink-0 ml-2">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100/50">
                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                                <User className="w-3 h-3 text-blue-400" />
                                Cliente
                            </div>
                            <p className="text-gray-900 font-bold text-sm truncate">{budget.clientes?.nombre || 'Consumidor Final'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100/50">
                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                                <Calendar className="w-3 h-3 text-blue-400" />
                                Fecha de Emisión
                            </div>
                            <p className="text-gray-900 font-bold text-sm">{new Date(budget.created_at).toLocaleDateString('es-AR', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">
                            <Package className="w-3 h-3 text-blue-400" />
                            Productos ({budget.presupuesto_items?.length || 0})
                        </div>
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/80">
                                        <tr>
                                            <th className="text-left px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">Producto</th>
                                            <th className="text-center px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">Cant</th>
                                            <th className="text-right px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">Precio U.</th>
                                            <th className="text-right px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {budget.presupuesto_items?.map((item, idx) => {
                                            const itemSubtotal = item.subtotal ?? (item.cantidad * item.precio_unitario);
                                            return (
                                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-4 py-3 min-w-[150px]">
                                                        <div className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">
                                                            {item.nombre || item.productos?.nombre || 'Producto'}
                                                        </div>
                                                        {item.productos?.codigo && (
                                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">[{item.productos.codigo}]</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-xs font-bold text-gray-600">{item.cantidad}</td>
                                                    <td className="px-4 py-3 text-right text-xs text-gray-500">${item.precio_unitario.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right font-black text-gray-900 text-xs sm:text-sm">${itemSubtotal.toLocaleString()}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <FileText className="w-3 h-3 text-blue-400" />
                                Observaciones
                            </div>
                            {!isEditingObs ? (
                                <button
                                    onClick={() => setIsEditingObs(true)}
                                    className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    Editar
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditingObs(false);
                                            setObs(budget.observaciones || '');
                                        }}
                                        className="text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors mr-2"
                                        disabled={isSaving}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveObservation}
                                        className="px-2 py-1 bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        Guardar
                                    </button>
                                </div>
                            )}
                        </div>
                        {isEditingObs ? (
                            <textarea
                                value={obs}
                                onChange={(e) => setObs(e.target.value)}
                                className="w-full bg-blue-50/50 rounded-xl p-4 border border-blue-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all min-h-[120px] resize-none shadow-inner"
                                placeholder="Escribe una observación aquí..."
                                autoFocus
                            />
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-inner">
                                <p className="text-gray-600 italic text-sm leading-relaxed">
                                    {budget.observaciones ? `"${budget.observaciones}"` : "Sin observaciones adicionales"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Totals */}
                <div className="p-4 sm:p-6 border-t bg-white">
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="text-gray-700">${budget.subtotal.toLocaleString()}</span>
                        </div>
                        {budget.descuento > 0 && (
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Bonificación</span>
                                    <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-black">
                                        {discountPercentage}% OFF
                                    </span>
                                </div>
                                <span className="text-green-600">-${budget.descuento.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Total Presupuestado</span>
                                <span className="text-blue-600 font-black text-3xl leading-none">
                                    ${budget.total.toLocaleString()}
                                </span>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-xl hidden sm:block">
                                <Package className="w-8 h-8 text-blue-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
