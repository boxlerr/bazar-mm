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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Nombre */}
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                        Nombre Completo <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                            <User className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            name="nombre"
                            required
                            defaultValue={cliente?.nombre}
                            className="pl-10 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                            <Mail className="h-4 w-4" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            defaultValue={cliente?.email}
                            className="pl-10 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>
                </div>

                {/* Teléfono */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                        Teléfono
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                            <Phone className="h-4 w-4" />
                        </div>
                        <input
                            type="tel"
                            name="telefono"
                            defaultValue={cliente?.telefono}
                            className="pl-10 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                            placeholder="+54 11 1234-5678"
                        />
                    </div>
                </div>

                {/* DNI */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                        DNI
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                            <Shield className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            name="dni"
                            defaultValue={cliente?.dni}
                            className="pl-10 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                            placeholder="12.345.678"
                        />
                    </div>
                </div>

                {/* Dirección */}
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                        Dirección
                    </label>
                    <div className="relative group">
                        <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                            <MapPin className="h-4 w-4 mt-0.5" />
                        </div>
                        <textarea
                            name="direccion"
                            rows={3}
                            defaultValue={cliente?.direccion}
                            className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 resize-none"
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

            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100/60">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500/10 transition-all font-semibold disabled:opacity-50 flex items-center"
                >
                    <X className="w-4 h-4 mr-2 text-gray-400" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all font-bold disabled:opacity-50 flex items-center shadow-[0_0_20px_rgba(37,99,235,0.2)]"
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
