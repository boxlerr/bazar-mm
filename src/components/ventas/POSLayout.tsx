'use client';

import { useState } from 'react';
import { usePOS } from '@/hooks/usePOS';
import ProductSearch from './ProductSearch';
import CartSummary from './CartSummary';
import PaymentModal from './PaymentModal';

export default function POSLayout() {
    const {
        cart,
        subtotal,
        total,
        loading,
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        search,
        addToCart,
        removeFromCart,
        updateQuantity,
        checkout
    } = usePOS();

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handleCheckout = async (method: string) => {
        const result = await checkout(method);
        if (result && result.success) {
            setIsPaymentModalOpen(false);
            // Opcional: Mostrar mensaje de éxito o notificación toast
        } else {
            alert('Error al procesar la venta');
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6">
            {/* Columna Izquierda: Búsqueda y Productos */}
            <div className="flex-1 flex flex-col min-w-0">
                <ProductSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    search={search}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    onSelect={(product) => {
                        addToCart(product);
                        setSearchTerm('');
                        // Limpiar resultados visualmente si se desea
                    }}
                />

                {/* Aquí podría ir una grilla de productos frecuentes o categorías si se desea expandir */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <p className="text-lg font-medium">Panel de Productos Frecuentes</p>
                        <p className="text-sm">(Próximamente)</p>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Carrito */}
            <div className="w-[400px] flex-shrink-0">
                <CartSummary
                    cart={cart}
                    subtotal={subtotal}
                    total={total}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onCheckout={() => setIsPaymentModalOpen(true)}
                />
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                total={total}
                onConfirm={handleCheckout}
                loading={loading}
            />
        </div>
    );
}
