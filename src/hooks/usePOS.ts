'use client';

import { useState, useEffect, useCallback } from 'react';
import { Producto } from '@/types';
import { processSale, searchProducts } from '@/app/(dashboard)/ventas/actions';
// import { printTicket } from '@/lib/printer/PrinterService'; // Asumimos que existe o lo crearemos
// Si no existe PrinterService, usaremos la lógica directa por ahora y luego refactorizamos.
// Revisando archivos anteriores, vi BotonImprimirTicket que usa PrinterService.
// Vamos a crear un servicio simple de impresión si no lo encuentro fácil, pero mejor uso fetch directo al 3001.

import { Cliente } from '@/types/cliente';
import { toast } from 'sonner';
import { getEmpresaConfig } from '@/app/(dashboard)/configuracion/empresa/actions';

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

    // Cliente seleccionado para la venta
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

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
        // Validación de stock inicial
        if (product.stock_actual <= 0) {
            toast.error('Producto sin stock');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                // Validar si al sumar 1 superamos el stock
                if (existing.cantidad + 1 > product.stock_actual) {
                    toast.error(`Stock insuficiente. Solo hay ${product.stock_actual} unidades.`);
                    return prev;
                }
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

        const itemInCart = cart.find(i => i.id === productId);
        if (itemInCart) {
            if (quantity > itemInCart.stock_actual) {
                toast.error(`Stock insuficiente. Solo hay ${itemInCart.stock_actual} unidades.`);
                // Opcional: ajustar al máximo posible
                // quantity = itemInCart.stock_actual; 
                // Por ahora solo retornamos sin cambios
                return;
            }
        }

        setCart(prev => prev.map(item =>
            item.id === productId
                ? { ...item, cantidad: quantity, subtotal: quantity * item.precio_venta }
                : item
        ));
    };

    // Procesar venta
    const checkout = async (paymentMethod: string) => {
        if (!isCajaOpen) {
            toast.error('Debe abrir la caja antes de realizar una venta');
            return;
        }
        if (cart.length === 0) return;
        setLoading(true);

        try {
            const saleData = {
                cliente_id: selectedClient?.id,
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
                    // Obtener configuración de empresa actualizada
                    const empresaConfig = await getEmpresaConfig();
                    console.log('POS Checkout - Config Empresa:', empresaConfig);

                    // Construir objeto para impresión (adaptado a lo que espera el server)
                    // Esto es una simplificación, idealmente usamos el PrinterService
                    const ticketData = {
                        venta: {
                            ...result.venta,
                            cliente_nombre: selectedClient ? selectedClient.nombre : 'Consumidor Final',
                            usuario_nombre: result.venta.usuarios?.nombre || 'Cajero',
                        },
                        items: cart.map(item => ({
                            nombre: item.nombre,
                            cantidad: item.cantidad,
                            precio_unitario: item.precio_venta,
                            subtotal: item.subtotal
                        })),
                        empresa: {
                            nombre: empresaConfig.nombre || 'BAZAR M&M',
                            direccion: empresaConfig.direccion || 'Dirección Local',
                            cuit: empresaConfig.cuit || '00-00000000-0',
                            telefono: empresaConfig.telefono,
                            email: empresaConfig.email,
                            mensaje_footer: empresaConfig.mensaje_ticket
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
                    toast.warning('Venta guardada pero error al imprimir ticket. Verifique el servidor de impresión.');
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
    const [isCajaLoading, setIsCajaLoading] = useState(true);

    useEffect(() => {
        checkCajaStatus();
    }, []);

    const checkCajaStatus = async () => {
        try {
            setIsCajaLoading(true);
            const { getCajaState } = await import('@/app/(dashboard)/caja/actions');
            const caja = await getCajaState();
            setIsCajaOpen(!!caja);
        } catch (error) {
            console.error('Error checking caja status:', error);
        } finally {
            setIsCajaLoading(false);
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
        isCajaLoading,
        checkCajaStatus,
        selectedClient,
        setSelectedClient
    };
}
