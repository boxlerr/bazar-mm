'use client';

import { useState } from 'react';
import { Cliente } from '@/types/cliente';
import { Mail, Phone, MapPin, User, Save, X, AlertCircle, Loader2, Shield } from 'lucide-react';

interface ClienteFormProps {
    cliente?: Cliente | null;
    onSubmit: (data: FormData) => Promise<void>;
    onCancel: () => void;
}

export default function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            await onSubmit(formData);
        } catch (err: any) {
            setError(err.message || 'Error al guardar el cliente');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="nombre"
                            required
                            defaultValue={cliente?.nombre}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            defaultValue={cliente?.email}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>
                </div>

                {/* Teléfono */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            name="telefono"
                            defaultValue={cliente?.telefono}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+54 11 1234-5678"
                        />
                    </div>
                </div>

                {/* DNI */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        DNI
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Shield className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="dni"
                            defaultValue={cliente?.dni}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="12.345.678"
                        />
                    </div>
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <textarea
                            name="direccion"
                            rows={3}
                            defaultValue={cliente?.direccion}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Calle Falsa 123, Ciudad"
                        />
                    </div>
                </div>

                {/* Límite de Crédito (Solo si es necesario, oculto por defecto si simple) */}
                {/* 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Límite de Crédito
          </label>
           ...
        </div> 
        */}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center shadow-lg shadow-blue-600/20"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {cliente ? 'Actualizar Cliente' : 'Crear Cliente'}
                </button>
            </div>
        </form>
    );
}
