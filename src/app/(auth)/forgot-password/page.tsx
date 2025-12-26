'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const supabase = createClient();

        try {
            // Usamos el flujo estándar de Supabase, que enviará el email
            // Ojo: Si Supabase no tiene el email configurado, esto fallará o no enviará nada.
            // El usuario pidió "usar Resend".
            // Para usar Resend con Supabase Auth, hay que deshabilitar el email de supabase o hookear.
            // Pero una forma más simple es generar un link manual si tenemos acceso admin, 
            // O simplemente llamar a una Server Action que use adminAuth para generar link y enviar por Resend.

            // INTENTO 1: Usar la API de Supabase directa.
            // Si el usuario ya configuró SMTP en Supabase, esto funciona.
            // Si NO, Supabase tiene un límite de emails.

            // Dado que el usuario pidió explícitamente "implementar resend", 
            // vamos a asumir que quiere que NOSOTROS enviemos el email.

            // Opción: Server Action que genera link
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al enviar correo');

            setIsSent(true);
            toast.success('Correo enviado con éxito');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Ocurrió un error');
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
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-red-600 to-red-800" />

                {/* Header */}
                <div className="text-center space-y-3 relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-red-600 shadow-sm border border-red-200/50">
                            <Mail size={28} className="drop-shadow-sm" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recuperar Contraseña</h1>
                    <p className="text-gray-500 text-base leading-relaxed">
                        Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace de recuperación.
                    </p>
                </div>

                {isSent ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3 shadow-sm">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <h3 className="text-emerald-900 font-semibold text-lg">¡Correo enviado!</h3>
                            <p className="text-emerald-700/80 text-sm leading-relaxed">
                                Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar las instrucciones.
                            </p>
                        </div>

                        <Link href="/login" className="block">
                            {/* Fixed variant to default/primary specifically for readability or explicit custom styling */}
                            <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-neutral-900/10 hover:shadow-neutral-900/20 flex items-center justify-center group">
                                <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                Volver al inicio de sesión
                            </button>
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-200 font-medium text-gray-900 placeholder:text-gray-400"
                                    placeholder="nombre@empresa.com"
                                    required
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
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Instrucciones'
                            )}
                        </Button>

                        <div className="text-center pt-2">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors py-2"
                            >
                                <ArrowLeft size={16} className="mr-1.5" />
                                Cancelar y volver
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
