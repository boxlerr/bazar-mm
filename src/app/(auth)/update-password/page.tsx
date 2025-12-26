'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if we have a session (handled by Supabase automatically via hash)
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, wait a bit as it might be setting up from hash
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (!retrySession) {
                        toast.error('Enlace inválido o expirado');
                        // Optionally redirect to login
                    }
                }, 1000);
            }
        };
        checkSession();
    }, []);

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
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setIsSuccess(true);
            toast.success('Contraseña actualizada correctamente');

            // Redirect after a 2 secons
            setTimeout(() => {
                router.push('/ventas');
            }, 2000);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al actualizar contraseña');
        } finally {
            setIsLoading(false);
        }
    };

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

                {isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3 shadow-sm">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <h3 className="text-emerald-900 font-semibold text-lg">¡Actualizada!</h3>
                            <p className="text-emerald-700/80 text-sm leading-relaxed">
                                Tu contraseña ha sido cambiada. Redirigiendo...
                            </p>
                        </div>
                    </motion.div>
                ) : (
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
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
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
                )}
            </motion.div>
        </div>
    );
}
