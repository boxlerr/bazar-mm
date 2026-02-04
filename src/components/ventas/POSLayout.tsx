'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePOS } from '@/hooks/usePOS';
import { User, X } from 'lucide-react';
import { toast } from 'sonner';
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
        isCajaLoading,
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

    const handleCheckout = async (pagos: { metodo: string; monto: number }[]) => {
        // @ts-ignore - checkout ahora espera array, aunque en types podria estar desactualizado
        const result = await checkout(pagos);
        if (result && result.success) {
            setIsPaymentModalOpen(false);
        } else {
            // El error ya se muestra en el hook usePOS idealmente o aqui
            if (result?.error) toast.error(result.error instanceof Error ? result.error.message : String(result.error));
            else toast.error('Error al procesar la venta');
        }
    };

    return (
        <div className="relative h-[calc(100vh-180px)] flex flex-col gap-4 pb-2">
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

            {/* Cliente Seleccionado */}
            <div className="flex-shrink-0 px-1">
                {selectedClient ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-900">Cliente Asignado</p>
                                <p className="text-lg font-bold text-blue-700">{selectedClient.nombre}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedClient(null)}
                            className="p-2 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
                            title="Desasignar cliente"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsClientModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                    >
                        <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Seleccionar Cliente para Cuenta Corriente</span>
                    </button>
                )}
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
            {/* Modal de Bloqueo por Caja Cerrada */}
            {!isCajaLoading && !isCajaOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔒</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Caja Cerrada</h2>
                        <p className="text-gray-500 mb-8">
                            Para realizar ventas, primero debe abrir la caja del día.
                        </p>
                        <Link
                            href="/caja"
                            className="inline-flex w-full items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5 transform duration-200"
                        >
                            Ir a Abrir Caja
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
