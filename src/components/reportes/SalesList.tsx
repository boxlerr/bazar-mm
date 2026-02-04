'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShoppingBag, CreditCard, User, ChevronLeft, ChevronRight, Pencil, Trash2, Check, X, Filter, BarChart3, Calendar, Search, RotateCcw } from 'lucide-react';
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
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        month: '',
        metodo_pago: '',
        usuario_id: ''
    });

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

    // Apply filtering client-side
    const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.created_at);

        // Date range filter
        if (filters.startDate && saleDate < new Date(filters.startDate)) return false;
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            if (saleDate > end) return false;
        }

        // Month filter (YYYY-MM)
        if (filters.month) {
            const [year, month] = filters.month.split('-');
            if (saleDate.getFullYear() !== parseInt(year) || (saleDate.getMonth() + 1) !== parseInt(month)) return false;
        }

        // Method filter
        if (filters.metodo_pago && sale.metodo_pago !== filters.metodo_pago) return false;

        // Seller filter
        if (filters.usuario_id && sale.usuario_id !== filters.usuario_id) return false;

        return true;
    });

    // Calculate Summary based on filtered results
    const summary = {
        total: filteredSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0),
        count: filteredSales.length,
        average: filteredSales.length > 0
            ? filteredSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0) / filteredSales.length
            : 0
    };

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredSales.slice(startIndex, startIndex + itemsPerPage);

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

    const resetFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            month: '',
            metodo_pago: '',
            usuario_id: ''
        });
        setCurrentPage(1);
    };

    const getMonthOptions = () => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = format(d, 'yyyy-MM');
            const label = format(d, 'MMMM yyyy', { locale: es });
            options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
        }
        return options;
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Filtrado</p>
                        <p className="text-2xl font-black text-gray-900">{formatPrice(summary.total)}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cant. Ventas</p>
                        <p className="text-2xl font-black text-gray-900">{summary.count}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Promedio</p>
                        <p className="text-2xl font-black text-gray-900">{formatPrice(summary.average)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header & Main Toggle */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="text-blue-500" />
                            Historial de Ventas
                        </h3>
                        <button
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${isFiltersOpen ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            <Filter size={16} />
                            Filtros
                            {(filters.startDate || filters.endDate || filters.month || filters.metodo_pago || filters.usuario_id) && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 self-stretch sm:self-auto">
                        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 mr-3 tracking-widest">PÁGINA</span>
                            <span className="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{currentPage}</span>
                            <span className="text-xs font-bold text-gray-400 mx-2">de</span>
                            <span className="text-sm font-black text-gray-700">{totalPages || 1}</span>

                            <div className="flex gap-1.5 ml-4 border-l border-gray-200 pl-4">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:shadow-md disabled:opacity-20 disabled:hover:shadow-none transition-all"
                                    title="Anterior"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:shadow-md disabled:opacity-20 disabled:hover:shadow-none transition-all"
                                    title="Siguiente"
                                >
                                    <ChevronRight size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                {isFiltersOpen && (
                    <div className="p-5 bg-gray-50/50 border-b border-gray-100 animate-in slide-in-from-top duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Mes */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar size={10} /> Por Mes
                                </label>
                                <select
                                    value={filters.month}
                                    onChange={(e) => { setFilters({ ...filters, month: e.target.value, startDate: '', endDate: '' }); setCurrentPage(1); }}
                                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                >
                                    <option value="">Todos los meses</option>
                                    {getMonthOptions().map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Rango */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar size={10} /> Rango Personalizado
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => { setFilters({ ...filters, startDate: e.target.value, month: '' }); setCurrentPage(1); }}
                                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:border-blue-500 outline-none"
                                    />
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => { setFilters({ ...filters, endDate: e.target.value, month: '' }); setCurrentPage(1); }}
                                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Método de Pago */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <CreditCard size={10} /> Método de Pago
                                </label>
                                <select
                                    value={filters.metodo_pago}
                                    onChange={(e) => { setFilters({ ...filters, metodo_pago: e.target.value }); setCurrentPage(1); }}
                                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option value="">Todos los métodos</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="cuenta_corriente">Cuenta Corriente</option>
                                    <option value="mercadopago">Mercado Pago</option>
                                </select>
                            </div>

                            {/* Vendedor */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <User size={10} /> Vendedor
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={filters.usuario_id}
                                        onChange={(e) => { setFilters({ ...filters, usuario_id: e.target.value }); setCurrentPage(1); }}
                                        className="flex-1 bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="">Todos los vendedores</option>
                                        {options.usuarios.map(u => (
                                            <option key={u.id} value={u.id}>{u.nombre}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={resetFilters}
                                        className="p-2 bg-white border-2 border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                        title="Limpiar filtros"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-4">Ticket</th>
                                <th className="px-5 py-4">Fecha</th>
                                <th className="px-5 py-4">Cliente</th>
                                <th className="px-5 py-4 w-24">Items</th>
                                <th className="px-5 py-4">Vendedor</th>
                                <th className="px-5 py-4">Pago</th>
                                <th className="px-5 py-4 text-right">Total</th>
                                <th className="px-5 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentData.map((venta, index) => {
                                const isEditing = editingId === venta.id;

                                return (
                                    <tr key={venta.id} className={`transition-colors ${isEditing ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                        {/* Ticket # */}
                                        <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-gray-400">
                                            #{venta.id.slice(0, 8).toUpperCase()}
                                        </td>

                                        {/* Fecha */}
                                        <td className="px-5 py-4 text-gray-600">
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
                        </tbody>
                    </table>
                    {filteredSales.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 bg-white">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No se encontraron ventas</p>
                            <p className="text-gray-300 text-sm mt-1">Intenta ajustando los filtros</p>
                        </div>
                    )}
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-4 p-4">
                    {currentData.map((venta) => {
                        const isEditing = editingId === venta.id;
                        return (
                            <div key={venta.id} className={`rounded-xl border p-4 transition-colors ${isEditing ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-blue-900 mb-2">Editar Venta</h4>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Fecha</label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.created_at}
                                                    onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                                                    className="w-full text-sm rounded-lg border-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Cliente</label>
                                                <select
                                                    value={formData.cliente_id}
                                                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                                                    className="w-full text-sm rounded-lg border-gray-300"
                                                >
                                                    <option value="">Consumidor Final</option>
                                                    {options.clientes.map(c => (
                                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Total</label>
                                                    <input
                                                        type="number"
                                                        value={formData.total}
                                                        onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) })}
                                                        className="w-full text-sm rounded-lg border-gray-300"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Pago</label>
                                                    <select
                                                        value={formData.metodo_pago}
                                                        onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                                                        className="w-full text-sm rounded-lg border-gray-300"
                                                    >
                                                        <option value="efectivo">Efectivo</option>
                                                        <option value="tarjeta">Tarjeta</option>
                                                        <option value="transferencia">Transferencia</option>
                                                        <option value="mercadopago">Mercado Pago</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-blue-200/50 mt-2">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleSave(venta.id)}
                                                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg flex items-center gap-1"
                                            >
                                                <Check size={14} /> Guardar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-xs text-gray-500 block">
                                                    {format(new Date(venta.created_at), "d MMM, HH:mm", { locale: es })}
                                                </span>
                                                <span className="text-lg font-bold text-gray-900 block mt-0.5">
                                                    ${Number(venta.total).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium capitalize flex items-center gap-1.5 ${venta.metodo_pago?.includes('efectivo') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                <CreditCard size={12} />
                                                {venta.metodo_pago?.replace('_', ' ') || 'Efectivo'}
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 mb-4">
                                            <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{venta.cliente_nombre}</p>
                                                    <p className="text-xs text-gray-500">Cliente</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 px-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                                    <ShoppingBag size={14} className="text-gray-400" />
                                                    <span>{venta.venta_items?.reduce((acc: number, item: any) => acc + item.cantidad, 0) || 0} items</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <User size={14} className="text-gray-400" />
                                                    <span className="truncate max-w-[100px]">{venta.usuario?.nombre}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => handleEditClick(venta)}
                                                className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Pencil size={14} /> Editar
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(venta.id)}
                                                className="flex-1 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={14} /> Eliminar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {sales.length === 0 && (
                        <div className="text-center text-gray-400 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No hay ventas registradas recientemente
                        </div>
                    )}
                </div>

                <DeleteConfirmationModal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={handleDelete}
                    title="Eliminar Venta"
                    description="¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer."
                />
            </div>
        </div>
    );
}

// Helper function to format prices
const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(amount);
};
