'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="bg-red-50/80 border border-red-100 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-4 text-sm backdrop-blur-md shadow-lg shadow-red-500/5"
          >
            <div className="bg-red-500 rounded-full p-1 shadow-sm shadow-red-500/40">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold tracking-tight">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <motion.div variants={itemVariants} className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-bold text-neutral-800 ml-1 tracking-tight"
          >
            Correo Electrónico
          </label>
          <div className="relative group">
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 z-10",
              focusedField === 'email' ? "text-red-500 scale-110" : "text-neutral-400"
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
              className="w-full pl-12 pr-4 py-4 bg-neutral-50/50 border-2 border-neutral-100 rounded-2xl focus:bg-white focus:border-red-500/20 focus:ring-[6px] focus:ring-red-500/5 transition-all outline-none text-neutral-900 placeholder-neutral-400 font-medium shadow-sm"
              placeholder="ejemplo@bazar.com"
            />
            {focusedField === 'email' && (
              <motion.div
                layoutId="focuseffect"
                className="absolute inset-0 border-2 border-red-500/30 rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label
              htmlFor="password"
              className="block text-sm font-bold text-neutral-800 tracking-tight"
            >
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-red-600 hover:text-red-700 transition-all hover:tracking-tight"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative group">
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 z-10",
              focusedField === 'password' ? "text-red-500 scale-110" : "text-neutral-400"
            )}>
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 bg-neutral-50/50 border-2 border-neutral-100 rounded-2xl focus:bg-white focus:border-red-500/20 focus:ring-[6px] focus:ring-red-500/5 transition-all outline-none text-neutral-900 placeholder-neutral-400 font-medium shadow-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500 transition-colors focus:outline-none z-10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={showPassword ? 'eye-off' : 'eye'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
            {focusedField === 'password' && (
              <motion.div
                layoutId="focuseffect"
                className="absolute inset-0 border-2 border-red-500/30 rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="flex items-center gap-3 ml-1">
        <div className="relative flex items-center group">
          <input
            type="checkbox"
            id="remember"
            className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-neutral-200 transition-all checked:border-red-600 checked:bg-red-600 hover:border-red-300 shadow-sm"
          />
          <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          <motion.div
            className="absolute inset-0 rounded-lg bg-red-500/10 scale-0 group-hover:scale-125 transition-transform duration-300 -z-10 blur-sm"
          />
        </div>
        <label htmlFor="remember" className="text-sm font-semibold text-neutral-600 cursor-pointer select-none hover:text-neutral-900 transition-colors">
          Mantener sesión iniciada
        </label>
      </motion.div>

      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full h-16 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-red-600/20 active:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg tracking-tight">Procesando...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-lg tracking-tight">Entrar al Sistema</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </div>
        )}
      </motion.button>


    </motion.form>
  );
}
