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
        checkout,
        isCajaOpen
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
        <div className="h-[calc(100vh-180px)] flex flex-col gap-4 pb-2">
            {/* Buscador Superior */}
            <div className="flex-shrink-0">
                <ProductSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    search={search}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    onSelect={(product) => {
                        addToCart(product);
                        setSearchTerm('');
                        // Mantenemos la lista abierta para permitir múltiples selecciones
                    }}
                />
            </div>

            {/* Área Principal: Carrito como Tabla */}
            <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
