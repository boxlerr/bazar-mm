'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Trash2, Package, DollarSign, TrendingUp, Plus, Minus, Loader2, Scissors, Barcode, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Producto } from '@/types/producto';
import { useRole } from '@/hooks/useRole';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default function ProductoDetallePage({ params }: Props) {
    const router = useRouter();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editando, setEditando] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Split States
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitUnits, setSplitUnits] = useState(1);
    const [splitBarcode, setSplitBarcode] = useState('');

    const { permissions } = useRole();

    const [historial, setHistorial] = useState<any[]>([]);

    useEffect(() => {
        loadProducto();
    }, []);

    const loadProducto = async () => {
        const { id } = await params;
        const supabase = createClient();
        const { data } = await supabase
            .from('productos')
            .select('*')
            .eq('id', id)
            .single();

        if (data) {
            setProducto(data);
            // Cargar historial
            const { data: movs, error } = await supabase
                .from('movimientos_stock')
                .select(`*, usuario:usuarios(nombre)`)
                .eq('producto_id', id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (movs) setHistorial(movs);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!producto) return;
        setSaving(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('productos')
                .update({
                    nombre: producto.nombre,
                    codigo: producto.codigo,
                    codigo_barra: producto.codigo_barra,
                    descripcion: producto.descripcion,
                    categoria: producto.categoria,
                    precio_costo: producto.precio_costo,
                    precio_venta: producto.precio_venta,
                    stock_actual: producto.stock_actual,
                    stock_minimo: producto.stock_minimo,
                    activo: producto.activo,
                    units_per_pack: producto.units_per_pack,
                })
                .eq('id', producto.id);

            if (error) throw error;

            setEditando(false);
            await loadProducto();
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!producto) return;

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('productos')
                .delete()
                .eq('id', producto.id);

            if (error) throw error;

            router.push('/stock');
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar el producto');
        }
    };

    const adjustStock = (amount: number) => {
        if (!producto) return;
        setProducto({
            ...producto,
            stock_actual: Math.max(0, producto.stock_actual + amount)
        });
    };

    const handleSplitPack = async () => {
        if (!producto) return;
        if (splitUnits <= 1) {
            toast.error('Las unidades deben ser mayores a 1');
            return;
        }

        try {
            const newStock = producto.stock_actual * splitUnits;
            const newPrice = producto.precio_venta / splitUnits; // Sugerencia de precio
            const newCost = producto.precio_costo / splitUnits;

            const supabase = createClient();
            const { error } = await supabase
                .from('productos')
                .update({
                    stock_actual: newStock,
                    precio_venta: newPrice,
                    precio_costo: newCost,
                    units_per_pack: splitUnits,
                    codigo_barra: splitBarcode || producto.codigo_barra,
                })
                .eq('id', producto.id);

            if (error) throw error;

            // Registrar movimiento
            await supabase.from('movimientos_stock').insert({
                producto_id: producto.id,
                tipo: 'ajuste_manual',
                cantidad: newStock - producto.stock_actual,
                stock_nuevo: newStock,
                motivo: `Desglose de Pack (x${splitUnits})`,
                usuario_id: (await supabase.auth.getUser()).data.user?.id
            });

            toast.success('Pack desglosado correctamente');
            setShowSplitModal(false);
            loadProducto();
        } catch (error) {
            console.error(error);
            toast.error('Error al desglosar pack');
        }
    };

    const calcularMargen = () => {
        if (!producto) return 0;
        if (producto.precio_costo === 0) return 0;
        return ((producto.precio_venta - producto.precio_costo) / producto.precio_costo) * 100;
    };



    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando producto...</p>
                </div>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Package className="w-16 h-16 text-gray-300" />
                <p className="text-gray-500 text-lg">Producto no encontrado</p>
                <Link
                    href="/stock"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    Volver al inventario
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto pb-10"
        >
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/stock"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Stock
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {producto.nombre}
                            </h1>
                            <span
                                className={`px-3 py-1 text-sm font-bold rounded-full border ${producto.activo
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}
                            >
                                {producto.activo ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                        <p className="text-gray-500">Código: {producto.codigo}</p>
                    </div>

                    <div className="flex gap-3">
                        {!editando ? (
                            <>
                                <button
                                    onClick={() => setEditando(true)}
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm hover:shadow"
                                >
                                    Editar
                                </button>
                                {permissions?.productos?.eliminar && (
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm hover:shadow"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Eliminar
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setEditando(false);
                                        loadProducto();
                                    }}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm hover:shadow disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Guardar
                                        </>
                                    )}
                                </button>
                            </>
                        )}


                        {/* Split Button (visible si no está editando) */}
                        {!editando && (
                            <button
                                onClick={() => {
                                    setSplitUnits(producto.units_per_pack && producto.units_per_pack > 1 ? producto.units_per_pack : 1);
                                    setShowSplitModal(true);
                                }}
                                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm hover:shadow"
                                title="Desglosar Pack en Unidades"
                            >
                                <Scissors className="w-4 h-4" />
                                Desglosar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Información del Producto */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="bg-blue-50 p-2.5 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Información</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre</label>
                            {editando ? (
                                <input
                                    type="text"
                                    value={producto.nombre}
                                    onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900 font-bold text-lg">{producto.nombre}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Código</label>
                                {editando ? (
                                    <input
                                        type="text"
                                        value={producto.codigo}
                                        onChange={(e) => setProducto({ ...producto, codigo: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-700 font-mono">{producto.codigo}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Código Barra</label>
                                {editando ? (
                                    <input
                                        type="text"
                                        value={producto.codigo_barra || ''}
                                        onChange={(e) => setProducto({ ...producto, codigo_barra: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-700 font-mono">{producto.codigo_barra || '-'}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Categoría</label>
                            {editando ? (
                                <select
                                    value={producto.categoria}
                                    onChange={(e) => setProducto({ ...producto, categoria: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Almacén">Almacén</option>
                                    <option value="Bebidas">Bebidas</option>
                                    <option value="Limpieza">Limpieza</option>
                                    <option value="Librería">Librería</option>
                                    <option value="Bazar">Bazar</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            ) : (
                                <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                    {producto.categoria}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Descripción</label>
                            {editando ? (
                                <textarea
                                    value={producto.descripcion || ''}
                                    onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Descripción del producto..."
                                />
                            ) : (
                                <p className="text-sm text-gray-700">{producto.descripcion || 'Sin descripción'}</p>
                            )}
                        </div>

                        {editando && (
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="activo"
                                    checked={producto.activo}
                                    onChange={(e) => setProducto({ ...producto, activo: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Producto activo
                                </label>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Precios */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="bg-green-50 p-2.5 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Precios</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Precio Costo</label>
                            {editando ? (
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        value={producto.precio_costo}
                                        onChange={(e) => setProducto({ ...producto, precio_costo: parseFloat(e.target.value) })}
                                        min="0"
                                        step="0.01"
                                        className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">${formatNumber(producto.precio_costo)}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Precio Venta</label>
                            {editando ? (
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        value={producto.precio_venta}
                                        onChange={(e) => setProducto({ ...producto, precio_venta: parseFloat(e.target.value) })}
                                        min="0"
                                        step="0.01"
                                        className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            ) : (
                                <p className="text-2xl font-bold text-green-600">${formatNumber(producto.precio_venta)}</p>
                            )}
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                <p className="text-xs font-semibold text-purple-700 uppercase">Margen de Ganancia</p>
                            </div>
                            <p className={`text-3xl font-bold ${calcularMargen() >= 30 ? 'text-green-600' : calcularMargen() >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {calcularMargen().toFixed(1)}%
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                                Ganancia: ${formatNumber(producto.precio_venta - producto.precio_costo)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stock */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="bg-orange-50 p-2.5 rounded-lg">
                            <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Stock</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Stock Actual</label>
                            {editando ? (
                                <div className="flex items-center gap-2 w-full">
                                    <button
                                        onClick={() => adjustStock(-1)}
                                        className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors shrink-0"
                                        type="button"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="number"
                                        value={producto.stock_actual === 0 ? '' : producto.stock_actual}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setProducto({
                                                ...producto,
                                                stock_actual: val === '' ? 0 : parseInt(val)
                                            });
                                        }}
                                        min="0"
                                        placeholder="0"
                                        className="flex-1 min-w-0 border border-gray-200 rounded-xl px-2 py-3 text-center text-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => adjustStock(1)}
                                        className="p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors shrink-0"
                                        type="button"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-4xl font-bold text-gray-900 text-center">{producto.stock_actual}</p>
                            )}
                        </div>

                        {editando && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stock Mínimo</label>
                                <input
                                    type="number"
                                    value={producto.stock_minimo}
                                    onChange={(e) => setProducto({ ...producto, stock_minimo: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Eliminar Producto</h3>
                            </div>

                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que deseas eliminar <span className="font-bold">{producto.nombre}</span>?
                                Esta acción no se puede deshacer.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition font-bold"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Split Modal */}
            <AnimatePresence>
                {showSplitModal && producto && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Scissors className="w-5 h-5 text-purple-600" />
                                    Desglosar Pack
                                </h3>
                                <button onClick={() => setShowSplitModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                                    <p>
                                        Estás a punto de convertir <strong>{producto.stock_actual} packs</strong> en unidades individuales.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unidades por Pack
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="2"
                                            value={splitUnits}
                                            onChange={(e) => setSplitUnits(parseInt(e.target.value) || 0)}
                                            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-bold text-lg"
                                        />
                                        <span className="text-gray-500 font-medium">unidades</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nuevo Código de Barra (Unitario)
                                    </label>
                                    <div className="relative">
                                        <Barcode className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={splitBarcode}
                                            onChange={(e) => setSplitBarcode(e.target.value)}
                                            placeholder="Escanear..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Dejar vacío para mantener: {producto.codigo_barra}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vista Previa</h4>

                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-500">Stock:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{producto.stock_actual}</span>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                            <span className="font-bold text-green-600">{producto.stock_actual * splitUnits}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Precio Venta:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">${formatNumber(producto.precio_venta)}</span>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                            <span className="font-bold text-green-600">${formatNumber(producto.precio_venta / splitUnits)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSplitPack}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl transition font-bold shadow-lg shadow-purple-600/20"
                                >
                                    Confirmar Desglose
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="bg-purple-50 p-2.5 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Historial de Movimientos (Kardex)</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="pb-3 pl-4">Fecha</th>
                                <th className="pb-3">Tipo</th>
                                <th className="pb-3">Detalle</th>
                                <th className="pb-3 text-right">Cantidad</th>
                                <th className="pb-3 text-right">Stock</th>
                                <th className="pb-3 text-right pr-4">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {historial.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        No hay movimientos registrados recientemente.
                                    </td>
                                </tr>
                            ) : (
                                historial.map((mov) => (
                                    <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 pl-4 text-sm text-gray-600">
                                            {new Date(mov.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-3">
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${mov.tipo === 'venta' ? 'bg-green-100 text-green-700' :
                                                mov.tipo === 'compra' ? 'bg-blue-100 text-blue-700' :
                                                    mov.tipo === 'ajuste_manual' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {mov.tipo.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm text-gray-700 max-w-xs truncate" title={mov.motivo}>
                                            {mov.motivo || '-'}
                                        </td>
                                        <td className={`py-3 text-right font-bold ${mov.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {mov.cantidad > 0 ? '+' : ''}{mov.cantidad}
                                        </td>
                                        <td className="py-3 text-right text-sm font-mono text-gray-600">
                                            {mov.stock_nuevo}
                                        </td>
                                        <td className="py-3 text-right pr-4 text-sm text-gray-500">
                                            {mov.usuario?.nombre || 'Sistema'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
