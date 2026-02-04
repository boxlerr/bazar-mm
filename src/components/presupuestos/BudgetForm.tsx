'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, User, Save, ArrowLeft, Plus, X, Package, DollarSign } from 'lucide-react';
import { createBudget } from '@/app/(dashboard)/presupuestos/actions';
import ProductSearch from '@/components/ventas/ProductSearch';
import ClientSelectionModal from '@/components/ventas/ClientSelectionModal';
import { Producto } from '@/types';
import { Cliente } from '@/types/cliente';
import { cn } from '@/lib/utils';

interface CartItem {
    id: string; // Internal ID for manual items or product ID
    producto?: Producto;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
}

export default function BudgetForm() {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [observaciones, setObservaciones] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchResults, setSearchResults] = useState<Producto[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchProducts = async (term: string, autoAdd = false) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const { searchProducts } = await import('@/app/(dashboard)/ventas/actions');
            const results = await searchProducts(term);
            setSearchResults(results);

            if (autoAdd && results.length > 0) {
                const exactMatch = results.find(p => p.codigo === term || p.codigo_barra === term);
                if (exactMatch) {
                    addToCart(exactMatch);
                    setSearchTerm('');
                    setSearchResults([]);
                }
            }
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addToCart = (product: Producto) => {
        setItems(prev => {
            const existing = prev.find(item => item.producto?.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.producto?.id === product.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                producto: product,
                nombre: product.nombre,
                cantidad: 1,
                precio_unitario: product.precio_venta
            }];
        });
        toast.success('Producto agregado');
    };

    const addManualItem = () => {
        const newItem: CartItem = {
            id: `manual-${Date.now()}`,
            nombre: 'Nuevo Item',
            cantidad: 1,
            precio_unitario: 0
        };
        setItems(prev => [...prev, newItem]);
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id: string, updates: Partial<CartItem>) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, ...updates } : item
            )
        );
    };

    const subtotal = items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    const discountValue = (subtotal * discountPercentage) / 100;
    const total = subtotal - discountValue;

    const handleSubmit = async () => {
        if (items.length === 0) {
            toast.error('El presupuesto debe tener al menos un producto');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createBudget({
                cliente_id: cliente?.id,
                items: items.map(item => ({
                    producto_id: item.producto?.id,
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario
                })),
                subtotal,
                total,
                descuento: discountValue,
                observaciones,
            });

            if (result.success) {
                toast.success('Presupuesto creado correctamente');
                router.push('/presupuestos');
            } else {
                toast.error(result.error || 'Error al crear presupuesto');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Nuevo Presupuesto</h2>
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 sm:bg-transparent px-3 py-1.5 rounded-lg sm:px-0 sm:py-0"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Volver</span>
                    <span className="sm:hidden">Atrás</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Search & Manual Add */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <ProductSearch
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                search={searchProducts}
                                searchResults={searchResults}
                                isSearching={isSearching}
                                onSelect={(p) => {
                                    addToCart(p);
                                    setSearchTerm('');
                                    setSearchResults([]);
                                }}
                            />
                        </div>
                        <button
                            onClick={addManualItem}
                            className="bg-white px-4 py-3 sm:py-2 border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 flex items-center justify-center shadow-sm font-bold text-sm transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-1" />
                            <span className="hidden sm:inline">Agregar Manual</span>
                            <span className="sm:hidden text-xs uppercase tracking-wider">Manual</span>
                        </button>
                    </div>

                    {/* Desktop Items View */}
                    <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cant</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                                                No hay productos en el presupuesto
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={item.nombre}
                                                        onChange={(e) => updateItem(item.id, { nombre: e.target.value })}
                                                        className="text-sm font-bold text-gray-900 w-full border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-0 bg-transparent transition-colors"
                                                    />
                                                    <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider mt-1">{item.producto?.codigo || 'Item Manual'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => updateItem(item.id, { cantidad: Math.max(1, item.cantidad - 1) })}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-black transition-all active:scale-90"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-6 text-sm font-black text-gray-900">{item.cantidad}</span>
                                                        <button
                                                            onClick={() => updateItem(item.id, { cantidad: item.cantidad + 1 })}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-black transition-all active:scale-90"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end text-sm font-bold text-gray-900">
                                                        <span className="mr-1 text-gray-400 font-normal">$</span>
                                                        <input
                                                            type="number"
                                                            value={item.precio_unitario}
                                                            onChange={(e) => updateItem(item.id, { precio_unitario: Number(e.target.value) })}
                                                            className="w-20 text-right border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-0 bg-transparent transition-colors font-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            onFocus={(e) => e.target.select()}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-black text-blue-600">
                                                    ${(item.precio_unitario * item.cantidad).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Items View */}
                    <div className="sm:hidden space-y-3">
                        {items.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                                Agregue productos para comenzar
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm relative">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="mb-3 pr-6">
                                        <input
                                            type="text"
                                            value={item.nombre}
                                            onChange={(e) => updateItem(item.id, { nombre: e.target.value })}
                                            className="text-sm font-bold text-gray-900 w-full border-0 p-0 focus:ring-0 bg-transparent placeholder:text-gray-300"
                                            placeholder="Nombre del producto"
                                        />
                                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                            {item.producto?.codigo || 'Manual'}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => updateItem(item.id, { cantidad: Math.max(1, item.cantidad - 1) })}
                                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm font-black text-sm transition-all active:scale-90"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-xs font-black text-gray-900">{item.cantidad}</span>
                                            <button
                                                onClick={() => updateItem(item.id, { cantidad: item.cantidad + 1 })}
                                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm font-black text-sm transition-all active:scale-90"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="flex-1 flex flex-col items-end">
                                            <div className="flex items-center font-bold text-gray-600 text-[10px] uppercase tracking-wider mb-0.5">
                                                Precio U.
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    value={item.precio_unitario}
                                                    onChange={(e) => updateItem(item.id, { precio_unitario: Number(e.target.value) })}
                                                    className="w-20 text-right border-0 p-0 focus:ring-0 bg-transparent font-black text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </div>
                                        </div>

                                        <div className="text-right border-l pl-4 border-gray-100">
                                            <div className="font-bold text-gray-600 text-[10px] uppercase tracking-wider mb-0.5">
                                                Subtotal
                                            </div>
                                            <div className="text-sm font-black text-blue-600">
                                                ${(item.precio_unitario * item.cantidad).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar / Bottom Panel */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Cliente */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                            <User className="w-4 h-4 mr-2 text-blue-500" />
                            Cliente
                        </h3>
                        {cliente ? (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 relative group animate-in fade-in slide-in-from-top-2 duration-300">
                                <button
                                    onClick={() => setCliente(null)}
                                    className="absolute top-2 right-2 p-1.5 text-blue-400 hover:text-blue-600 transition-colors bg-white/50 rounded-lg"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <p className="font-black text-blue-900 leading-tight">{cliente.nombre}</p>
                                <p className="text-[10px] text-blue-600 mt-1 uppercase font-black tracking-widest bg-blue-100 w-fit px-1.5 py-0.5 rounded">
                                    {cliente.telefono || 'Sin registro teléfono'}
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsClientModalOpen(true)}
                                className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-bold text-sm flex flex-col items-center justify-center gap-2"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                    <Plus className="w-5 h-5" />
                                </div>
                                Vincular Cliente
                            </button>
                        )}
                    </div>

                    {/* Resumen */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Resumen</h3>
                            <div className="h-0.5 flex-1 bg-gray-50 mx-4"></div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Subtotal</span>
                                <span className="font-bold text-gray-900">${subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 font-medium">Descuento</span>
                                    {discountPercentage > 0 && (
                                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                            {discountPercentage}%
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={discountPercentage}
                                        onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                        className="w-16 pr-5 pl-2 text-right border-0 border-b border-gray-100 rounded-none py-1 text-sm focus:ring-0 focus:border-blue-500 outline-none font-black text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs select-none">%</span>
                                </div>
                            </div>

                            {discountPercentage > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-black text-green-600 bg-green-50 p-2 rounded-lg uppercase tracking-wider">
                                    <span>Se descuentan:</span>
                                    <span>-${discountValue.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="pt-4 mt-4 border-t-2 border-dashed border-gray-50">
                                <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-500/30">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Total a Presupuestar</span>
                                        <span className="text-2xl font-black">${total.toLocaleString()}</span>
                                    </div>
                                    <Package className="w-8 h-8 opacity-20" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Comentarios adicionales</label>
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                className="w-full bg-gray-50 text-gray-700 border border-gray-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none min-h-[80px] sm:min-h-[100px] resize-none transition-all placeholder:text-gray-300"
                                placeholder="Escribe notas aquí que saldrán en el PDF..."
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || items.length === 0}
                            className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-xl active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-3" />
                            )}
                            Crear Presupuesto
                        </button>
                    </div>
                </div>
            </div>

            <ClientSelectionModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSelect={setCliente}
            />
        </div>
    );
}
