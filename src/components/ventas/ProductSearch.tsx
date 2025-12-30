'use client';

import { useRef, useEffect } from 'react';
import { Search, Barcode, Plus, X } from 'lucide-react';
import { Producto } from '@/types';

interface ProductSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    search: (term: string, autoAdd?: boolean) => void;
    searchResults: Producto[];
    isSearching: boolean;
    onSelect: (product: Producto) => void;
}

export default function ProductSearch({
    searchTerm,
    setSearchTerm,
    search,
    searchResults,
    isSearching,
    onSelect
}: ProductSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus al montar y listener global para escáner
    useEffect(() => {
        inputRef.current?.focus();

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Si el foco ya está en un input o textarea, no hacer nada
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return;
            }
            // Ignorar teclas de control o teclas especiales (F1, Escape, etc)
            if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
                return;
            }

            // Si es una tecla imprimible, enfocar el input
            inputRef.current?.focus();
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchTerm.trim()) {
                // Guardamos el término actual para buscar
                const termToSearch = searchTerm;

                // Limpiamos INMEDIATAMENTE el campo para recibir el siguiente código
                setSearchTerm('');

                // Ejecutamos la búsqueda
                search(termToSearch, true);
            }
        }
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleClear = () => {
        setSearchTerm('');
        search('', false); // Limpia los resultados también
        inputRef.current?.focus(); // Mantiene el foco para seguir escaneando
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Barcode className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Escanear código de barras o buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value.length > 2) {
                            search(e.target.value, false); // false = solo buscar sugerencias, no agregar
                        } else if (e.target.value.length === 0) {
                            search('', false); // Limpiar si borra todo manual
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isSearching ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    ) : (searchTerm || searchResults.length > 0) ? (
                        <button
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            title="Limpiar búsqueda"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    ) : (
                        <Search className="h-5 w-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
                <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {searchResults.map((product) => {
                        const hasStock = product.stock_actual > 0;
                        return (
                            <button
                                key={product.id}
                                onClick={() => hasStock && onSelect(product)}
                                disabled={!hasStock}
                                className={`w-full text-left px-3 py-2 flex items-center justify-between group transition-colors rounded-md ${hasStock
                                        ? 'hover:bg-gray-50 cursor-pointer'
                                        : 'opacity-50 cursor-not-allowed bg-gray-50'
                                    }`}
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{capitalize(product.nombre)}</p>
                                    <p className={`text-xs ${hasStock ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
                                        Código: {product.codigo} | Stock: {product.stock_actual}
                                        {!hasStock && ' (Sin Stock)'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-blue-600">
                                        {formatPrice(product.precio_venta)}
                                    </span>
                                    {hasStock ? (
                                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                    ) : (
                                        <span className="text-xs font-bold text-red-500">AGOTADO</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
