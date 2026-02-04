'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Presupuesto } from '@/types/presupuesto';
import { deleteBudget, updateBudgetStatus } from '@/app/(dashboard)/presupuestos/actions';
import { Trash2, Plus, ClipboardList, ChevronDown, ChevronRight, Printer, Eye, Calendar, User, DollarSign } from 'lucide-react';
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Presupuestos</h2>
                    <p className="text-sm text-gray-500">Gestiona y consulta los presupuestos realizados</p>
                </div>
                <button
                    onClick={() => router.push('/presupuestos/nuevo')}
                    className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 active:scale-95 font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Presupuesto
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                                                <td className="px-6 py-4 font-mono text-xs">
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
                                                                            <td colSpan={3} className="px-6 py-2 text-right text-xs font-bold text-gray-500 uppercase">Descuento ({Math.round((budget.descuento / budget.subtotal) * 100)}%)</td>
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {budgets.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                        <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No hay presupuestos registrados</p>
                    </div>
                ) : (
                    budgets.map((budget) => {
                        const statusBadge = getStatusBadge(budget.estado);
                        const isExpanded = expandedBudgetId === budget.id;

                        return (
                            <div
                                key={budget.id}
                                className={cn(
                                    "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all",
                                    isExpanded && "ring-2 ring-blue-500/20 bg-blue-50/5 shadow-md"
                                )}
                            >
                                <div className="p-4" onClick={() => toggleExpand(budget.id)}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase mb-0.5 tracking-wider">#{budget.nro_presupuesto}</span>
                                            <span className="font-bold text-gray-900 truncate max-w-[150px]">{budget.clientes?.nombre || 'Consumidor Final'}</span>
                                        </div>
                                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={budget.estado}
                                                onChange={(e) => handleStatusChange(e, budget.id)}
                                                disabled={isUpdating === budget.id}
                                                className={cn(
                                                    "pl-2 pr-6 py-1 text-[10px] uppercase font-black rounded-full transition-all outline-none appearance-none border-0",
                                                    statusBadge.bg,
                                                    statusBadge.text,
                                                    isUpdating === budget.id && "opacity-50 animate-pulse"
                                                )}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="convertido">Convertido</option>
                                                <option value="cancelado">Cancelado</option>
                                            </select>
                                            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(budget.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">Total</div>
                                            <div className="text-lg font-black text-gray-900">${budget.total.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBudgetForDetail(budget);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBudgetForPDF(budget);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs"
                                        >
                                            <Printer className="w-4 h-4" />
                                            PDF
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, budget.id)}
                                            className="w-12 flex items-center justify-center py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-xs"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Action to show more items inside card */}
                                    <div className="mt-3 flex justify-center">
                                        <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                                            {isExpanded ? 'Ocultar items' : 'Ver productos'}
                                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
                                        <div className="space-y-3">
                                            {budget.presupuesto_items?.map((item, idx) => {
                                                const itemSubtotal = item.subtotal ?? (item.cantidad * item.precio_unitario);
                                                return (
                                                    <div key={idx} className="flex justify-between items-start text-xs">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-gray-800">{item.nombre || item.productos?.nombre || 'Producto'}</span>
                                                            <span className="text-gray-400">{item.cantidad} x ${item.precio_unitario.toLocaleString()}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900">${itemSubtotal.toLocaleString()}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                                <span>Subtotal</span>
                                                <span>${budget.subtotal.toLocaleString()}</span>
                                            </div>
                                            {budget.descuento > 0 && (
                                                <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase">
                                                    <span>Descuento ({Math.round((budget.descuento / budget.subtotal) * 100)}%)</span>
                                                    <span>-${budget.descuento.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-xs font-black text-blue-600 uppercase pt-1">
                                                <span>Total</span>
                                                <span>${budget.total.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {budget.observaciones && (
                                            <div className="mt-4 p-3 bg-blue-100/50 rounded-lg text-[11px] text-blue-700 italic">
                                                "{budget.observaciones}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
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
