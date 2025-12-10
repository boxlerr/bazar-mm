'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Package, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function NuevoProductoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        codigo_barra: '',
        descripcion: '',
        categoria: 'Almacén',
        precio_costo: 0,
        precio_venta: 0,
        stock_actual: 0,
        stock_minimo: 5,
        activo: true,
    });

    const generateCodigo = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setFormData({ ...formData, codigo: `PROD-${timestamp}-${random}` });
    };

    const calcularMargen = () => {
        if (formData.precio_costo === 0) return 0;
        return ((formData.precio_venta - formData.precio_costo) / formData.precio_costo) * 100;
    };

    const suggerirPrecioVenta = (margen: number) => {
        const precioSugerido = formData.precio_costo * (1 + margen / 100);
        setFormData({ ...formData, precio_venta: Math.round(precioSugerido * 100) / 100 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();

            // Verificar si el código ya existe
            const { data: existing } = await supabase
                .from('productos')
                .select('id')
                .eq('codigo', formData.codigo)
                .single();

            if (existing) {
                alert('Ya existe un producto con ese código');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('productos')
                .insert([formData])
                .select()
                .single();

            if (error) throw error;

            router.push(`/stock/${data.id}`);
        } catch (error) {
            console.error('Error al crear producto:', error);
            alert('Error al crear el producto');
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto pb-10"
        >
            <div className="mb-8">
                <Link
                    href="/stock"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Stock
                </Link>

                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-xl">
                        <Package className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Nuevo Producto
                        </h1>
                        <p className="text-gray-500 mt-1">Completa la información del producto</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Básica */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                        Información Básica
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="Ej: Coca Cola 1.5L"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Código del Producto *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    placeholder="PROD-001"
                                />
                                <button
                                    type="button"
                                    onClick={generateCodigo}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                >
                                    Auto-generar
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Código de Barras / SKU
                            </label>
                            <input
                                type="text"
                                value={formData.codigo_barra}
                                onChange={(e) => setFormData({ ...formData, codigo_barra: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                placeholder="7790001234567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Categoría *
                            </label>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                            >
                                <option value="Almacén">Almacén</option>
                                <option value="Bebidas">Bebidas</option>
                                <option value="Limpieza">Limpieza</option>
                                <option value="Librería">Librería</option>
                                <option value="Bazar">Bazar</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Descripción detallada del producto..."
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Precios */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                        Precios
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Precio de Costo *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-400 font-medium">$</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.precio_costo}
                                    onChange={(e) => setFormData({ ...formData, precio_costo: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Precio de Venta *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-400 font-medium">$</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.precio_venta}
                                    onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-gray-700">Sugerir precio de venta</p>
                                <div className={`text-lg font-bold ${calcularMargen() >= 30 ? 'text-green-600' :
                                    calcularMargen() >= 15 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                    Margen: {calcularMargen().toFixed(1)}%
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => suggerirPrecioVenta(20)}
                                    className="flex-1 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors"
                                >
                                    +20%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => suggerirPrecioVenta(30)}
                                    className="flex-1 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors"
                                >
                                    +30%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => suggerirPrecioVenta(50)}
                                    className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors"
                                >
                                    +50%
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stock */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                        Inventario
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Stock Inicial *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.stock_actual}
                                onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-lg text-center"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Stock Mínimo *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.stock_minimo}
                                onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-lg text-center"
                                placeholder="5"
                            />
                            <p className="text-xs text-gray-500 mt-1">Se alertará cuando el stock esté por debajo de este valor</p>
                        </div>
                    </div>
                </motion.div>

                {/* Estado */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="activo"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Producto activo (visible en el stock)
                        </label>
                    </div>
                </motion.div>

                {/* Botones */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 shadow-lg rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <Link
                            href="/stock"
                            className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Crear Producto
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}
