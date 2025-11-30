'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Credenciales inválidas. Por favor, verifica tus datos.');
      } else {
        router.push('/ventas');
        router.refresh();
      }
    } catch {
      setError('Ocurrió un error al iniciar sesión. Inténtalo nuevamente.');
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

        <motion.div variants={itemVariants} className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative group">
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
              focusedField === 'password' ? "text-red-600" : "text-neutral-400"
            )}>
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600/10 focus:ring-4 focus:ring-red-600/10 transition-all outline-none text-neutral-900 placeholder-neutral-400 font-medium"
              placeholder="••••••••"
            />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="flex items-center gap-2 ml-1">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-neutral-300 transition-all checked:border-red-600 checked:bg-red-600 hover:border-red-400"
          />
          <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        <label htmlFor="remember" className="text-sm font-medium text-neutral-600 cursor-pointer select-none">
          Mantener sesión iniciada
        </label>
      </motion.div>

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
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <span className="text-lg">Ingresar al Sistema</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </motion.button>

      <motion.p variants={itemVariants} className="text-center text-sm text-neutral-500 font-medium">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-red-600 hover:text-red-700 font-bold transition-colors hover:underline decoration-2 underline-offset-4">
          Regístrate aquí
        </Link>
      </motion.p>
    </motion.form>
  );
}
