'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShoppingBag, CreditCard, User, ChevronLeft, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { updateSale, deleteSale, getDataForEditSale } from '@/app/(dashboard)/ventas/actions';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

interface SalesListProps {
    data: any[];
}

export default function SalesList({ data }: SalesListProps) {
    const router = useRouter();
    const [sales, setSales] = useState(data); // Local state for optimistic updates
    const [currentPage, setCurrentPage] = useState(1);

    // Edit & Delete state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [options, setOptions] = useState<{ clientes: any[], usuarios: any[] }>({ clientes: [], usuarios: [] });

    // Form state
    const [formData, setFormData] = useState({
        created_at: '',
        cliente_id: '',
        usuario_id: '',
        metodo_pago: '',
        total: 0
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(sales.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = sales.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setSales(data);
    }, [data]);

    useEffect(() => {
        // Fetch options lazily or on mount
        getDataForEditSale().then(setOptions);
    }, []);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    const handleEditClick = (sale: any) => {
        setEditingId(sale.id);
        setFormData({
            created_at: new Date(sale.created_at).toISOString().slice(0, 16),
            cliente_id: sale.cliente_id || '',
            usuario_id: sale.usuario_id || '',
            metodo_pago: sale.metodo_pago || 'efectivo',
            total: sale.total
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSave = async (saleId: string) => {
        try {
            const dateToSend = new Date(formData.created_at).toISOString();
            const result = await updateSale(saleId, { ...formData, created_at: dateToSend });

            if (result.success) {
                toast.success('Venta actualizada');
                setEditingId(null);

                // Optimistic update
                setSales(prev => prev.map(s => s.id === saleId ? {
                    ...s,
                    ...formData,
                    created_at: dateToSend,
                    // If backend returned updated objects we'd use that, but here we patch manually for speed
                    // Ideally we refresh relations too or return them from action
                    cliente_nombre: options.clientes.find(c => c.id === formData.cliente_id)?.nombre || s.cliente_nombre,
                    usuario: options.usuarios.find(u => u.id === formData.usuario_id) || s.usuario
                } : s));

                router.refresh();
            } else {
                toast.error(result.error || 'Error al actualizar');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar cambios');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const result = await deleteSale(deleteId);
            if (result.success) {
                toast.success('Venta eliminada');
                setDeleteId(null);
                setSales(prev => prev.filter(s => s.id !== deleteId));
                router.refresh();
            } else {
                toast.error(result.error || 'Error al eliminar');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-blue-500" />
                    Historial de Ventas Recientes
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        {sales.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, sales.length)} de {sales.length}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft size={16} className="text-gray-600" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight size={16} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3 w-24">Items</th>
                            <th className="px-4 py-3">Vendedor</th>
                            <th className="px-4 py-3">Pago</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentData.map((venta, index) => {
                            const isEditing = editingId === venta.id;

                            return (
                                <tr key={venta.id} className={`transition-colors ${isEditing ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                    {/* Fecha */}
                                    <td className="px-4 py-3 text-gray-600">
                                        {isEditing ? (
                                            <input
                                                type="datetime-local"
                                                value={formData.created_at}
                                                onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                                                className="w-full rounded border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        ) : (
                                            format(new Date(venta.created_at), "d MMM, HH:mm", { locale: es })
                                        )}
                                    </td>

                                    {/* Cliente */}
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {isEditing ? (
                                            <select
                                                value={formData.cliente_id}
                                                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                                                className="w-full rounded border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Consumidor Final</option>
                                                {options.clientes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            venta.cliente_nombre
                                        )}
                                    </td>

                                    {/* Items - Compact with Tooltip */}
                                    <td className="px-4 py-3">
                                        <div className="relative group">
                                            <div className="flex items-center gap-1.5 cursor-help w-max">
                                                <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                                                    {venta.venta_items?.reduce((acc: number, item: any) => acc + item.cantidad, 0) || 0} u.
                                                </div>
                                            </div>

                                            {/* Tooltip */}
                                            <div className={`absolute left-0 z-50 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block
                                                ${currentData.length > 4 && index >= currentData.length - 2 ? 'bottom-full mb-1' : 'top-full mt-1'}
                                            `}>
                                                <p className="text-xs font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-1">
                                                    Detalle de productos
                                                </p>
                                                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                                                    {venta.venta_items?.map((item: any, idx: number) => (
                                                        <li key={idx} className="text-xs text-gray-600 flex justify-between items-start gap-2">
                                                            <span className="text-gray-900 font-medium shrink-0">{item.cantidad}x</span>
                                                            <span className="leading-tight">{item.productos?.nombre || 'Producto desconocido'}</span>
                                                        </li>
                                                    ))}
                                                    {(!venta.venta_items || venta.venta_items.length === 0) && (
                                                        <li className="text-xs text-gray-400 italic">Sin items</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Vendedor */}
                                    <td className="px-4 py-3 text-gray-500">
                                        {isEditing ? (
                                            <select
                                                value={formData.usuario_id}
                                                onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                                                className="w-full rounded border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Desconocido</option>
                                                {options.usuarios.map(u => (
                                                    <option key={u.id} value={u.id}>{u.nombre}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <User size={14} />
                                                {venta.usuario?.nombre}
                                            </div>
                                        )}
                                    </td>

                                    {/* Pago */}
                                    <td className="px-4 py-3 text-gray-500 capitalize">
                                        {isEditing ? (
                                            <select
                                                value={formData.metodo_pago}
                                                onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                                                className="w-full rounded border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="efectivo">Efectivo</option>
                                                <option value="tarjeta">Tarjeta</option>
                                                <option value="transferencia">Transferencia</option>
                                                <option value="cuenta_corriente">Cta. Corriente</option>
                                                <option value="mercadopago">Mercado Pago</option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <CreditCard size={14} />
                                                {venta.metodo_pago?.replace('_', ' ') || 'Efectivo'}
                                            </div>
                                        )}
                                    </td>

                                    {/* Total */}
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={formData.total}
                                                onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) })}
                                                className="w-20 rounded border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500 text-right"
                                                step="0.01"
                                            />
                                        ) : (
                                            `$${Number(venta.total).toLocaleString('es-AR')}`
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3 text-right text-gray-500">
                                        {isEditing ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleSave(venta.id)}
                                                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded-full"
                                                    title="Guardar"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-full"
                                                    title="Cancelar"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(venta)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(venta.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                    No hay ventas registradas recientemente
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Eliminar Venta"
                description="¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer."
            />
        </div>
    );
}
