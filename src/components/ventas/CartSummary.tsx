'use client';

import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartItem } from '@/hooks/usePOS';

interface CartSummaryProps {
    cart: CartItem[];
    subtotal: number;
    total: number;
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
    onCheckout: () => void;
}

export default function CartSummary({
    cart,
    subtotal,
    total,
    onUpdateQuantity,
    onRemove,
    onCheckout
}: CartSummaryProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-bold text-gray-900">Carrito de Compra</h2>
                <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {cart.reduce((acc, item) => acc + item.cantidad, 0)} items
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                        <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                        <p>El carrito está vacío</p>
                        <p className="text-sm">Escanea un producto para comenzar</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg group">
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                                <p className="text-xs text-gray-500">${item.precio_venta.toFixed(2)} x {item.cantidad}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-white rounded-lg border border-gray-200">
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
                                        className="p-1 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                                        className="p-1 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>

                                <span className="text-sm font-bold text-gray-900 w-20 text-right">
                                    ${item.subtotal.toFixed(2)}
                                </span>

                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={cart.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold text-lg shadow-sm hover:shadow transition-all active:scale-[0.98]"
                >
                    Cobrar ${total.toFixed(2)}
                </button>
            </div>
        </div>
    );
}
