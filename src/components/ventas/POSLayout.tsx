'use client';

import { useState, useEffect } from 'react';
import { usePOS } from '@/hooks/usePOS';
import ProductSearch from './ProductSearch';
import CartSummary from './CartSummary';
import PaymentModal from './PaymentModal';
import ClientSelectionModal from './ClientSelectionModal';
import { getDolarBlue, getDolarOficial } from '@/services/dolarService';

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
        isCajaOpen,
        selectedClient,
        setSelectedClient
    } = usePOS();

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [dolarBlue, setDolarBlue] = useState<number>(0);
    const [dolarOficial, setDolarOficial] = useState<number>(0);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const [blue, oficial] = await Promise.all([
                    getDolarBlue(),
                    getDolarOficial()
                ]);
                setDolarBlue(blue.venta);
                setDolarOficial(oficial.venta);
            } catch (error) {
                console.error('Error fetching rates:', error);
            }
        };
        fetchRates();
    }, []);

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
                    dolarBlue={dolarBlue}
                    dolarOficial={dolarOficial}
                />
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                total={total}
                onConfirm={handleCheckout}
                loading={loading}
                selectedClient={selectedClient}
                dolarBlue={dolarBlue}
                dolarOficial={dolarOficial}
            />

            <ClientSelectionModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSelect={(client) => setSelectedClient(client)}
            />
        </div>
    );
}
