'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updateSale, deleteSale, getDataForEditSale } from '@/app/(dashboard)/ventas/actions';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

interface SalesHistoryTableProps {
    initialSales: any[];
}

export default function SalesHistoryTable({ initialSales }: SalesHistoryTableProps) {
    const router = useRouter();
    const [sales, setSales] = useState(initialSales);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [options, setOptions] = useState<{ clientes: any[], usuarios: any[] }>({ clientes: [], usuarios: [] });

    // Form state for inline editing
    const [formData, setFormData] = useState({
        created_at: '',
        cliente_id: '',
        usuario_id: '',
        metodo_pago: '',
        total: 0
    });

    useEffect(() => {
        setSales(initialSales);
    }, [initialSales]);

    // Fetch options once when component mounts (or could fetch on first edit to save resources)
    useEffect(() => {
        getDataForEditSale().then(setOptions);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                router.refresh(); // Refresh server data

                // Optimistic update (optional, but nice)
                setSales(sales.map(s => s.id === saleId ? {
                    ...s,
                    ...formData,
                    created_at: dateToSend,
                    clientes: options.clientes.find(c => c.id === formData.cliente_id) || s.clientes,
                    usuarios: options.usuarios.find(u => u.id === formData.usuario_id) || s.usuarios
                } : s));
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
                setSales(sales.filter(s => s.id !== deleteId)); // Optimistic removal
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ticket #
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                                Fecha
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                Items
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Método Pago
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vendedor
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No hay ventas registradas aún.
                                </td>
                            </tr>
                        ) : (
                            sales.map((sale: any, index: number) => {
                                const isEditing = editingId === sale.id;

                                return (
                                    <tr key={sale.id} className={`transition-colors ${isEditing ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                        {/* Ticket # (Static) */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                            {sale.id.slice(0, 8)}
                                        </td>

                                        {/* Fecha */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {isEditing ? (
                                                <input
                                                    type="datetime-local"
                                                    value={formData.created_at}
                                                    onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                                                    className="w-full rounded border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                formatDate(sale.created_at)
                                            )}
                                        </td>

                                        {/* Cliente */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                                                sale.clientes?.nombre || 'Consumidor Final'
                                            )}
                                        </td>

                                        {/* Productos */}
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="relative group">
                                                <div className="flex items-center gap-1.5 cursor-help w-max">
                                                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                                                        {sale.venta_items?.reduce((acc: number, item: any) => acc + item.cantidad, 0) || 0} u.
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        ({sale.venta_items?.length || 0} items)
                                                    </span>
                                                </div>

                                                {/* Tooltip */}
                                                <div className={`absolute left-0 z-50 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block
                                                    ${sales.length > 4 && index >= sales.length - 2 ? 'bottom-full mb-1' : 'top-full mt-1'}
                                                `}>
                                                    <p className="text-xs font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-1">
                                                        Detalle de productos
                                                    </p>
                                                    <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                                                        {sale.venta_items?.map((item: any, idx: number) => (
                                                            <li key={idx} className="text-xs text-gray-600 flex justify-between items-start gap-2">
                                                                <span className="text-gray-900 font-medium shrink-0">{item.cantidad}x</span>
                                                                <span className="leading-tight">{item.productos?.nombre || 'Producto desconocido'}</span>
                                                            </li>
                                                        ))}
                                                        {(!sale.venta_items || sale.venta_items.length === 0) && (
                                                            <li className="text-xs text-gray-400 italic">Sin items</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Metodo Pago */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
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
                                                sale.metodo_pago.replace('_', ' ')
                                            )}
                                        </td>

                                        {/* Vendedor */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                                sale.usuarios?.nombre || '-'
                                            )}
                                        </td>

                                        {/* Total */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={formData.total}
                                                    onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) })}
                                                    className="w-24 rounded border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500 text-right"
                                                    step="0.01"
                                                />
                                            ) : (
                                                formatCurrency(sale.total)
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isEditing ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSave(sale.id)}
                                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded-full"
                                                        title="Guardar"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-full"
                                                        title="Cancelar"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(sale)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="Editar venta"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(sale.id)}
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Eliminar venta"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
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
