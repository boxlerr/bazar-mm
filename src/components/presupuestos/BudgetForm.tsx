'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, User, Save, ArrowLeft, Plus, X } from 'lucide-react';
import { createBudget } from '@/app/(dashboard)/presupuestos/actions';
import ProductSearch from '@/components/ventas/ProductSearch';
import ClientSelectionModal from '@/components/ventas/ClientSelectionModal';
import { Producto } from '@/types';
import { Cliente } from '@/types/cliente';

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Nuevo Presupuesto</h2>
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex gap-4">
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
                            className="bg-white px-4 py-2 border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 flex items-center shadow-sm font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-1" />
                            Agregar Manual
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No hay productos en el presupuesto
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={item.nombre}
                                                    onChange={(e) => updateItem(item.id, { nombre: e.target.value })}
                                                    className="text-sm font-medium text-gray-900 w-full border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-0 bg-transparent transition-colors"
                                                />
                                                <div className="text-xs text-gray-400 mt-1">{item.producto?.codigo || 'Manual'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => updateItem(item.id, { cantidad: Math.max(1, item.cantidad - 1) })}
                                                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-sm font-medium">{item.cantidad}</span>
                                                    <button
                                                        onClick={() => updateItem(item.id, { cantidad: item.cantidad + 1 })}
                                                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-medium">
                                                <div className="flex items-center justify-end">
                                                    <span className="mr-1 text-gray-400">$</span>
                                                    <input
                                                        type="number"
                                                        value={item.precio_unitario}
                                                        onChange={(e) => updateItem(item.id, { precio_unitario: Number(e.target.value) })}
                                                        className="w-24 text-right border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-0 bg-transparent transition-colors font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        onFocus={(e) => e.target.select()}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                ${(item.precio_unitario * item.cantidad).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-500" />
                            Cliente
                        </h3>
                        {cliente ? (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 relative group">
                                <button
                                    onClick={() => setCliente(null)}
                                    className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p className="font-bold text-blue-900">{cliente.nombre}</p>
                                <p className="text-xs text-blue-600 mt-1 uppercase font-semibold tracking-wider">{cliente.telefono || 'Sin teléfono'}</p>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsClientModalOpen(true)}
                                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-medium flex items-center justify-center"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Seleccionar Cliente
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-semibold text-gray-900">${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Descuento (%)</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={discountPercentage}
                                        onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                        className="w-20 pr-7 pl-2 text-right border border-gray-200 rounded-lg py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold select-none">%</span>
                                </div>
                            </div>
                            {discountPercentage > 0 && (
                                <div className="flex justify-between items-center text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                                    <span>Ahorro aplicado:</span>
                                    <span className="font-bold">-${discountValue.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t pt-4 flex justify-between items-center">
                                <span className="text-base font-bold text-gray-900">Total Final</span>
                                <span className="text-2xl font-black text-blue-600">${total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Observaciones</label>
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
                                placeholder="Notas adicionales..."
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || items.length === 0}
                            className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            Guardar Presupuesto
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
