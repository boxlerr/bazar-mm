'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UpdatePasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Token no encontrado. Asegúrate de usar el enlace completo del correo.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al actualizar contraseña');
            }

            setIsSuccess(true);
            toast.success('Contraseña actualizada correctamente');

            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (error: any) {
            console.error(error);
            setError(error.message);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center space-y-6"
                >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-2">
                        <Lock size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Enlace inválido o expirado</h2>
                        <p className="text-gray-500 text-sm mt-2">{error}</p>
                    </div>
                    <Link href="/forgot-password" className="block w-full">
                        <Button className="w-full bg-neutral-900 text-white">
                            Solicitar nuevo enlace
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center space-y-6"
                >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">¡Contraseña Actualizada!</h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Tu contraseña ha sido cambiada con éxito. Redirigiendo al login...
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-neutral-200/50 border border-neutral-100/80 p-8 md:p-10 space-y-8 overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-red-600 to-red-800" />

                <div className="text-center space-y-3 relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-red-600 shadow-sm border border-red-200/50">
                            <Lock size={28} className="drop-shadow-sm" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nueva Contraseña</h1>
                    <p className="text-gray-500 text-base leading-relaxed">
                        Ingresa una nueva contraseña segura para tu cuenta.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="pass" className="text-sm font-semibold text-gray-700 ml-1">
                                Nueva Contraseña
                            </label>
                            <input
                                id="pass"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-200"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="conf-pass" className="text-sm font-semibold text-gray-700 ml-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="conf-pass"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-200"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:text-white text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Actualizando...
                            </>
                        ) : (
                            'Cambiar Contraseña'
                        )}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
