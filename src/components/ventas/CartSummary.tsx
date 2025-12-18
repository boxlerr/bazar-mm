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
    dolarBlue?: number;
    dolarOficial?: number;
}

export default function CartSummary({
    cart,
    subtotal,
    total,
    onUpdateQuantity,
    onRemove,
    onCheckout,
    dolarBlue = 0,
    dolarOficial = 0
}: CartSummaryProps) {
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatUSD = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header de la Tabla */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Producto</div>
                <div className="col-span-2 text-right">Precio Unit.</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Subtotal</div>
                <div className="col-span-1 text-center"></div>
            </div>

            {/* Cuerpo de la Tabla */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">El carrito está vacío</p>
                        <p className="text-sm">Escanea un producto para comenzar</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {cart.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 grid grid-cols-12 gap-4 items-center hover:shadow-md transition-all group">
                                {/* Producto */}
                                <div className="col-span-5 pr-4">
                                    <p className="text-base font-bold text-gray-900 truncate" title={item.nombre}>
                                        {capitalize(item.nombre)}
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                                        {item.codigo_barra || item.codigo}
                                    </p>
                                </div>

                                {/* Precio Unitario */}
                                <div className="col-span-2 text-right font-medium text-gray-600">
                                    {formatPrice(item.precio_venta)}
                                </div>

                                {/* Cantidad */}
                                <div className="col-span-2 flex justify-center">
                                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
                                            className="p-2 hover:bg-gray-200 text-gray-600 rounded-l-lg transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-bold text-gray-900">{item.cantidad}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                                            className="p-2 hover:bg-gray-200 text-gray-600 rounded-r-lg transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Subtotal */}
                                <div className="col-span-2 text-right font-bold text-gray-900 text-lg">
                                    {formatPrice(item.subtotal)}
                                </div>

                                {/* Acciones */}
                                <div className="col-span-1 text-center">
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer de Totales */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 px-6">
                <div className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2 text-gray-500">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="font-medium">{cart.reduce((acc, item) => acc + item.cantidad, 0)} artículos</span>
                    </div>

                    <div className="flex items-center gap-6 flex-1 justify-end">
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-right">
                                <p className="text-sm text-gray-500 font-medium uppercase">Total a Pagar</p>
                                <p className="text-3xl font-black text-gray-900 leading-none mt-1">{formatPrice(total)}</p>
                            </div>
                            {(dolarBlue > 0 || dolarOficial > 0) && (
                                <div className="flex gap-3 text-xs font-medium">
                                    {dolarBlue > 0 && (
                                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                            Blue: {formatUSD(total / dolarBlue)}
                                        </span>
                                    )}
                                    {dolarOficial > 0 && (
                                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                            Oficial: {formatUSD(total / dolarOficial)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={onCheckout}
                            disabled={cart.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-12 py-4 rounded-xl font-bold text-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:scale-[1.02] transition-all"
                        >
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
