'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(false);

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
        staggerChildren: 0.08,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }
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
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm"
          >
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {/* Email Field */}
        <motion.div variants={itemVariants} className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-stone-700"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300",
              focusedField === 'email' ? "text-stone-900" : "text-stone-400"
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
              className={cn(
                "w-full pl-12 pr-4 py-4 bg-stone-50 border-2 rounded-xl transition-all duration-300 outline-none text-stone-900 placeholder-stone-400",
                focusedField === 'email' 
                  ? "border-stone-900 bg-white shadow-sm" 
                  : "border-transparent hover:border-stone-200"
              )}
              placeholder="tu@email.com"
            />
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-stone-700"
            >
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors duration-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300",
              focusedField === 'password' ? "text-stone-900" : "text-stone-400"
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
              className={cn(
                "w-full pl-12 pr-12 py-4 bg-stone-50 border-2 rounded-xl transition-all duration-300 outline-none text-stone-900 placeholder-stone-400",
                focusedField === 'password' 
                  ? "border-stone-900 bg-white shadow-sm" 
                  : "border-transparent hover:border-stone-200"
              )}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors duration-300 focus:outline-none p-1"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Remember Me */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setRememberMe(!rememberMe)}
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center",
            rememberMe 
              ? "bg-stone-900 border-stone-900" 
              : "bg-white border-stone-300 hover:border-stone-400"
          )}
        >
          {rememberMe && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </button>
        <label 
          onClick={() => setRememberMe(!rememberMe)}
          className="text-sm text-stone-600 cursor-pointer select-none"
        >
          Mantener sesión iniciada
        </label>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group shadow-lg shadow-stone-900/10"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
