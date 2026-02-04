'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Presupuesto } from '@/types/presupuesto';
import { deleteBudget, updateBudgetStatus } from '@/app/(dashboard)/presupuestos/actions';
import { Trash2, Plus, ClipboardList, ChevronDown, ChevronRight, Printer, Eye } from 'lucide-react';
import { toast } from 'sonner';
import BudgetPDF from './BudgetPDF';
import BudgetDetailModal from './BudgetDetailModal';
import { cn } from '@/lib/utils';

interface BudgetListProps {
    initialBudgets: Presupuesto[];
}

export default function BudgetList({ initialBudgets }: BudgetListProps) {
    const router = useRouter();
    const [budgets, setBudgets] = useState<Presupuesto[]>(initialBudgets);
    const [selectedBudgetForPDF, setSelectedBudgetForPDF] = useState<Presupuesto | null>(null);
    const [selectedBudgetForDetail, setSelectedBudgetForDetail] = useState<Presupuesto | null>(null);
    const [expandedBudgetId, setExpandedBudgetId] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return;

        const result = await deleteBudget(id);
        if (result.success) {
            toast.success('Presupuesto eliminado');
            setBudgets(prev => prev.filter(b => b.id !== id));
        } else {
            toast.error('Error al eliminar presupuesto');
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
        e.stopPropagation();
        const newStatus = e.target.value as 'pendiente' | 'convertido' | 'cancelado';
        setIsUpdating(id);

        try {
            const result = await updateBudgetStatus(id, newStatus);
            if (result.success) {
                toast.success('Estado actualizado');
                setBudgets(prev => prev.map(b => b.id === id ? { ...b, estado: newStatus } : b));
            } else {
                toast.error('Error al actualizar estado');
            }
        } catch (error) {
            toast.error('Error de red');
        } finally {
            setIsUpdating(null);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedBudgetId(expandedBudgetId === id ? null : id);
    };

    const getStatusBadge = (estado: string) => {
        const statusConfig = {
            pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
            convertido: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Convertido' },
            cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' }
        };
        return statusConfig[estado as keyof typeof statusConfig] || statusConfig.pendiente;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Presupuestos</h2>
                    <p className="text-sm text-gray-500">Gestiona y consulta los presupuestos realizados</p>
                </div>
                <button
                    onClick={() => router.push('/presupuestos/nuevo')}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center transition-all shadow-lg shadow-blue-500/20 active:scale-95 font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Presupuesto
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="w-10 px-6 py-4"></th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Nro</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Total</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {budgets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="bg-gray-50 p-4 rounded-full">
                                                <ClipboardList className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-medium">No hay presupuestos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                budgets.map((budget) => {
                                    const statusBadge = getStatusBadge(budget.estado);
                                    return (
                                        <React.Fragment key={budget.id}>
                                            <tr
                                                onClick={() => toggleExpand(budget.id)}
                                                className={cn(
                                                    "group cursor-pointer transition-colors hover:bg-gray-50/80",
                                                    expandedBudgetId === budget.id && "bg-blue-50/30"
                                                )}
                                            >
                                                <td className="px-6 py-4">
                                                    {expandedBudgetId === budget.id ?
                                                        <ChevronDown className="w-4 h-4 text-blue-500" /> :
                                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(budget.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    #{budget.nro_presupuesto}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                                    {budget.clientes?.nombre || 'Consumidor Final'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 text-right">
                                                    ${budget.total.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={budget.estado}
                                                            onChange={(e) => handleStatusChange(e, budget.id)}
                                                            disabled={isUpdating === budget.id}
                                                            className={cn(
                                                                "pl-3 pr-8 py-1.5 text-xs font-bold rounded-full cursor-pointer transition-all outline-none appearance-none border-0",
                                                                statusBadge.bg,
                                                                statusBadge.text,
                                                                "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                                                                isUpdating === budget.id && "opacity-50 animate-pulse cursor-wait"
                                                            )}
                                                        >
                                                            <option value="pendiente">⏳ Pendiente</option>
                                                            <option value="convertido">✅ Convertido</option>
                                                            <option value="cancelado">❌ Cancelado</option>
                                                        </select>
                                                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center space-x-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedBudgetForDetail(budget);
                                                            }}
                                                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Ver Detalle"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedBudgetForPDF(budget);
                                                            }}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Imprimir / PDF"
                                                        >
                                                            <Printer className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(e, budget.id)}
                                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedBudgetId === budget.id && (
                                                <tr className="bg-gray-50/50">
                                                    <td colSpan={7} className="px-8 py-6">
                                                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                                            <table className="min-w-full divide-y divide-gray-100">
                                                                <thead className="bg-gray-50/50">
                                                                    <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Producto</th>
                                                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Cant.</th>
                                                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Precio Unit.</th>
                                                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Subtotal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50">
                                                                    {budget.presupuesto_items?.map((item, idx) => {
                                                                        const itemSubtotal = item.subtotal ?? (item.cantidad * item.precio_unitario);
                                                                        return (
                                                                            <tr key={idx}>
                                                                                <td className="px-6 py-3 text-sm text-gray-700">
                                                                                    <span className="font-medium">{item.nombre || item.productos?.nombre || 'Producto'}</span>
                                                                                    {item.productos?.codigo && <span className="text-xs text-gray-400 ml-2">[{item.productos.codigo}]</span>}
                                                                                </td>
                                                                                <td className="px-6 py-3 text-sm text-gray-600 text-center">{item.cantidad}</td>
                                                                                <td className="px-6 py-3 text-sm text-gray-600 text-right">${item.precio_unitario.toLocaleString()}</td>
                                                                                <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">${itemSubtotal.toLocaleString()}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                                <tfoot className="bg-gray-50/30">
                                                                    <tr>
                                                                        <td colSpan={3} className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Subtotal</td>
                                                                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-700">${budget.subtotal.toLocaleString()}</td>
                                                                    </tr>
                                                                    {budget.descuento > 0 && (
                                                                        <tr>
                                                                            <td colSpan={3} className="px-6 py-2 text-right text-xs font-bold text-gray-500 uppercase">Descuento</td>
                                                                            <td className="px-6 py-2 text-right text-sm font-bold text-green-600">-${budget.descuento.toLocaleString()}</td>
                                                                        </tr>
                                                                    )}
                                                                    <tr className="border-t border-gray-200">
                                                                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-black text-gray-900 uppercase">Total</td>
                                                                        <td className="px-6 py-4 text-right text-lg font-black text-blue-600">${budget.total.toLocaleString()}</td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                            {budget.observaciones && (
                                                                <div className="px-6 py-4 bg-blue-50/30 border-t border-gray-100">
                                                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Observaciones</p>
                                                                    <p className="text-sm text-gray-600 italic">"{budget.observaciones}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedBudgetForDetail && (
                <BudgetDetailModal
                    budget={selectedBudgetForDetail}
                    isOpen={!!selectedBudgetForDetail}
                    onClose={() => setSelectedBudgetForDetail(null)}
                />
            )}

            {/* PDF Modal */}
            {selectedBudgetForPDF && (
                <BudgetPDF
                    budget={selectedBudgetForPDF}
                    isOpen={!!selectedBudgetForPDF}
                    onClose={() => setSelectedBudgetForPDF(null)}
                />
            )}
        </div>
    );
}
