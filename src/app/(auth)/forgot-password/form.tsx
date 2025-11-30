'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ForgotPasswordForm() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('Ocurrió un error al enviar el correo. Inténtalo nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
            >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">¡Correo enviado!</h3>
                <p className="text-neutral-500 text-lg">
                    Hemos enviado las instrucciones para restablecer tu contraseña a <span className="font-medium text-neutral-900">{email}</span>
                </p>
                <div className="pt-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 text-red-600 font-bold hover:text-red-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="bg-red-50/50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm backdrop-blur-sm"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-5">
                <motion.div variants={itemVariants} className="space-y-1.5">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-neutral-700 ml-1"
                    >
                        Correo Electrónico
                    </label>
                    <div className="relative group">
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                            focusedField === 'email' ? "text-red-600" : "text-neutral-400"
                        )}>
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600/10 focus:ring-4 focus:ring-red-600/10 transition-all outline-none text-neutral-900 placeholder-neutral-400 font-medium"
                            placeholder="ejemplo@bazar.com"
                        />
                    </div>
                </motion.div>
            </div>

            <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Enviando...</span>
                    </>
                ) : (
                    <>
                        <span className="text-lg">Enviar Instrucciones</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </motion.button>

            <motion.p variants={itemVariants} className="text-center text-sm text-neutral-500 font-medium">
                <Link href="/login" className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                </Link>
            </motion.p>
        </motion.form>
    );
}
