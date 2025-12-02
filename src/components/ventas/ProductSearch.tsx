'use client';

import { useRef, useEffect } from 'react';
import { Search, Barcode, Plus } from 'lucide-react';
import { Producto } from '@/types';

interface ProductSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    search: (term: string) => void;
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

    // Auto-focus al montar
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            search(searchTerm);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Barcode className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Escanear código de barras o buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value.length > 2) {
                            search(e.target.value);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isSearching ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    ) : (
                        <Search className="h-5 w-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
                <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {searchResults.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => onSelect(product)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between group transition-colors rounded-md"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900">{product.nombre}</p>
                                <p className="text-xs text-gray-500">
                                    Código: {product.codigo} | Stock: {product.stock_actual}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-blue-600">
                                    ${product.precio_venta.toFixed(2)}
                                </span>
                                <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
