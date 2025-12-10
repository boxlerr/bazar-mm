'use client';

import { useState, useEffect, useCallback } from 'react';
import { Producto } from '@/types';
import { processSale, searchProducts } from '@/app/(dashboard)/ventas/actions';
import { printTicket } from '@/lib/printer/PrinterService'; // Asumimos que existe o lo crearemos
// Si no existe PrinterService, usaremos la lógica directa por ahora y luego refactorizamos.
// Revisando archivos anteriores, vi BotonImprimirTicket que usa PrinterService.
// Vamos a crear un servicio simple de impresión si no lo encuentro fácil, pero mejor uso fetch directo al 3001.

export interface CartItem extends Producto {
    cantidad: number;
    subtotal: number;
}

export function usePOS() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Producto[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Cargar carrito desde localStorage al inicio
    useEffect(() => {
        const savedCart = localStorage.getItem('pos_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error parsing saved cart:', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Guardar carrito en localStorage cada vez que cambia
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('pos_cart', JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    // Totales
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal; // Aquí se podrían aplicar descuentos globales

    // Buscar productos
    const search = useCallback(async (term: string, autoAdd: boolean = false) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchProducts(term);
            setSearchResults(results);

            // Si es coincidencia exacta de código de barra
            if (autoAdd) {
                const exactMatch = results.find(p => p.codigo_barra === term || p.codigo === term);
                if (exactMatch) {
                    addToCart(exactMatch);
                    setSearchTerm(''); // Limpiar para siguiente escaneo
                    setSearchResults([]);
                }
            }
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Agregar al carrito
    const addToCart = (product: Producto) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_venta }
                        : item
                );
            }
            return [...prev, { ...product, cantidad: 1, subtotal: product.precio_venta }];
        });
    };

    // Remover del carrito
    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    // Actualizar cantidad
    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.id === productId
                ? { ...item, cantidad: quantity, subtotal: quantity * item.precio_venta }
                : item
        ));
    };

    // Procesar venta
    const checkout = async (paymentMethod: string, clienteId?: string) => {
        if (cart.length === 0) return;
        setLoading(true);

        try {
            const saleData = {
                cliente_id: clienteId,
                items: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_venta
                })),
                subtotal, // Pasamos el subtotal calculado
                total,
                metodo_pago: paymentMethod
            };

            const result = await processSale(saleData);

            if (result.success && result.venta) {
                // Intentar imprimir
                try {
                    // Construir objeto para impresión (adaptado a lo que espera el server)
                    // Esto es una simplificación, idealmente usamos el PrinterService
                    const ticketData = {
                        venta: {
                            ...result.venta,
                            cliente_nombre: 'Cliente', // Deberíamos tener el nombre real si existe
                            usuario_nombre: 'Cajero', // Placeholder
                        },
                        items: cart.map(item => ({
                            nombre: item.nombre,
                            cantidad: item.cantidad,
                            precio_unitario: item.precio_venta,
                            subtotal: item.subtotal
                        })),
                        empresa: {
                            nombre: 'BAZAR M&M',
                            direccion: 'Dirección Local',
                            cuit: '00-00000000-0'
                        }
                    };

                    // Llamada directa al servidor de impresión local
                    await fetch('http://localhost:3001/imprimir/ticket', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ticketData)
                    });
                } catch (printError) {
                    console.error('Error printing ticket:', printError);
                    alert('Venta guardada pero error al imprimir ticket. Verifique el servidor de impresión.');
                }

                setCart([]); // Limpiar carrito
                localStorage.removeItem('pos_cart'); // Limpiar persistencia
                return { success: true, ventaId: result.venta.id };
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    // Verificar estado de caja
    const [isCajaOpen, setIsCajaOpen] = useState(false);

    useEffect(() => {
        checkCajaStatus();
    }, []);

    const checkCajaStatus = async () => {
        try {
            const { getCajaState } = await import('@/app/(dashboard)/caja/actions');
            const caja = await getCajaState();
            setIsCajaOpen(!!caja);
        } catch (error) {
            console.error('Error checking caja status:', error);
        }
    };

    return {
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
        checkCajaStatus
    };
}
