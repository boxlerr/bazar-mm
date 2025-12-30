'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/ventas';

    const [status, setStatus] = useState('Analizando enlace...');
    const [logs, setLogs] = useState<string[]>([]);
    const [isStuck, setIsStuck] = useState(false);
    const [fatalError, setFatalError] = useState<string | null>(null);

    const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), msg]);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const supabase = createClient();
            addLog('Iniciando proceso de callback...');

            // 0. Check for explicit errors in URL (Hash or Query)
            const hashParams = new URLSearchParams(window.location.hash.substring(1)); // remove #
            const errorParam = searchParams.get('error') || hashParams.get('error');
            const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');

            if (errorParam) {
                console.error('Error detected in URL:', errorParam, errorDesc);
                setFatalError(errorDesc?.replace(/\+/g, ' ') || 'El enlace es inválido o ha expirado.');
                setStatus('Error en el enlace');
                addLog(`Error: ${errorParam}`);
                return; // Stop processing
            }

            // 1. Check if potential token exists
            if (window.location.hash.includes('access_token')) {
                addLog('Token detectado en URL.');
                setStatus('Validando credenciales...');
            } else if (!window.location.hash && !searchParams.has('code')) {
                addLog('No se detectó token/código.');
                // We don't fail immediately, maybe session exists?
            }

            // 2. Set up listener
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                addLog(`Evento Auth: ${event}`);

                if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || (event === 'INITIAL_SESSION' && session)) {
                    if (session) {
                        setStatus('¡Sesión establecida!');
                        addLog('Usuario autenticado.');

                        await supabase.auth.getSession();

                        addLog('Redirigiendo...');
                        router.refresh();
                        setTimeout(() => router.replace(next), 500);
                    }
                }
            });

            // 3. Manual check fallback
            setTimeout(async () => {
                if (fatalError) return; // Don't check if we already failed

                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    addLog('Sesión encontrada (Manual Check).');
                    setStatus('Redirigiendo...');
                    router.refresh();
                    router.replace(next);
                } else {
                    if (!fatalError) {
                        addLog('Aún no hay sesión...');
                        setTimeout(() => {
                            if (!fatalError) setIsStuck(true);
                        }, 3000);
                    }
                }
            }, 1500);

            return () => {
                subscription.unsubscribe();
            };
        };

        handleAuthCallback();
    }, [router, next, searchParams, fatalError]);

    if (fatalError) {
        return (
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center space-y-6 shadow-xl shadow-neutral-200/50 max-w-sm w-full mx-4 border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <AlertCircle size={32} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-gray-900">Enlace Expirado o Inválido</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {fatalError === 'Email link is invalid or has expired'
                            ? 'Este enlace ya fue utilizado o ha vencido. Por seguridad, los enlaces son de un solo uso.'
                            : fatalError}
                    </p>
                </div>
                <Link href="/forgot-password" className="w-full">
                    <button className="w-full py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors">
                        <ArrowLeft size={16} />
                        Solicitar Nuevo Link
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center space-y-6 shadow-xl shadow-neutral-200/50 max-w-sm w-full mx-4">
            <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
                <div className="bg-red-50 p-4 rounded-full relative z-10">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
            </div>

            <div className="text-center space-y-2 w-full">
                <h2 className="text-xl font-bold text-gray-900">{status}</h2>
                <div className="text-xs text-left bg-gray-50 p-3 rounded-lg font-mono text-gray-400 space-y-1 h-24 overflow-hidden border border-gray-100">
                    {logs.map((log, i) => (
                        <div key={i}>{'>'} {log}</div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {isStuck && !fatalError && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full pt-2 border-t border-gray-100"
                    >
                        <p className="text-xs text-center text-gray-500 mb-3">
                            ¿Demasiado tiempo? Intenta continuar manualmente.
                        </p>
                        <button
                            onClick={() => router.replace(next)}
                            className="w-full py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
                        >
                            Continuar
                            <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 p-4">
            <Suspense fallback={
                <div className="bg-white rounded-3xl p-8 flex flex-col items-center animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
            }>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
