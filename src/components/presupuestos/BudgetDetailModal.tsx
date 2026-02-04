'use client';

import React, { useState } from 'react';
import { Presupuesto } from '@/types/presupuesto';
import { X, User, Calendar, FileText, Package, Save, Loader2, Edit2 } from 'lucide-react';
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
                // Nota: El componente padre debería refrescarse via revalidatePath o mutación local
                // En este flujo, al ser un modal sobre la lista, revalidatePath de Next.js refrescará los props
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    #{budget.nro_presupuesto}
                                </div>
                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold", status.bg, status.text)}>
                                    {status.label}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Detalle del Presupuesto</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                                <User className="w-3 h-3" />
                                Cliente
                            </div>
                            <p className="text-gray-900 font-semibold">{budget.clientes?.nombre || 'Consumidor Final'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                                <Calendar className="w-3 h-3" />
                                Fecha
                            </div>
                            <p className="text-gray-900 font-semibold">{new Date(budget.created_at).toLocaleDateString('es-AR', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
                            <Package className="w-3 h-3" />
                            Productos ({budget.presupuesto_items?.length || 0})
                        </div>
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                            <table className="w-full">
                                <thead className="bg-gray-100/80">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Producto</th>
                                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Cant.</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Precio</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {budget.presupuesto_items?.map((item, idx) => {
                                        const itemSubtotal = item.subtotal ?? (item.cantidad * item.precio_unitario);
                                        return (
                                            <tr key={idx} className="hover:bg-white/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-medium text-gray-900">{item.nombre || item.productos?.nombre || 'Producto'}</span>
                                                    {item.productos?.codigo && (
                                                        <span className="text-xs text-gray-400 ml-2">[{item.productos.codigo}]</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-600">{item.cantidad}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">${item.precio_unitario.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900">${itemSubtotal.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <FileText className="w-3 h-3" />
                                Observaciones
                            </div>
                            {!isEditingObs ? (
                                <button
                                    onClick={() => setIsEditingObs(true)}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors"
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
                                        className="text-red-500 hover:text-red-600 text-xs font-bold transition-colors"
                                        disabled={isSaving}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveObservation}
                                        className="text-green-600 hover:text-green-700 text-xs font-bold flex items-center gap-1 transition-colors"
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
                                className="w-full bg-blue-50 rounded-xl p-4 border border-blue-200 text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                placeholder="Escribe una observación aquí..."
                                autoFocus
                            />
                        ) : (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-gray-700 italic">
                                    {budget.observaciones ? `"${budget.observaciones}"` : "Sin observaciones"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Totals */}
                <div className="p-6 border-t bg-gray-50/50">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-700 font-medium">${budget.subtotal.toLocaleString()}</span>
                        </div>
                        {budget.descuento > 0 && (
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Descuento</span>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                        {discountPercentage}%
                                    </span>
                                </div>
                                <span className="text-green-600 font-medium">-${budget.descuento.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-3 border-t border-gray-200">
                            <span className="text-gray-900 font-bold text-lg">Total</span>
                            <span className="text-blue-600 font-black text-2xl">${budget.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
