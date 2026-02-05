'use client';

import LoginForm from './form';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-stone-50">
      {/* Left Side - Elegant Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-stone-900">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full p-16 text-white h-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight">Bazar M&M</span>
              <p className="text-stone-400 text-sm">Sistema de Gestión</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-8 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <h1 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-balance">
                Control total de tu negocio en un solo lugar
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-xl text-stone-400 leading-relaxed max-w-md"
            >
              Inventario, ventas y facturación integrados para potenciar el crecimiento de tu empresa.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex gap-12 pt-8"
            >
              <div>
                <p className="text-4xl font-bold text-white">100%</p>
                <p className="text-stone-500 text-sm mt-1">En la nube</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">24/7</p>
                <p className="text-stone-500 text-sm mt-1">Disponible</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">Seguro</p>
                <p className="text-stone-500 text-sm mt-1">Encriptado</p>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center justify-between text-sm text-stone-500"
          >
            <span>© {new Date().getFullYear()} Bazar M&M</span>
            <a
              href="https://vaxler.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              Desarrollado por Vaxler
            </a>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-stone-700/30 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white relative">
        {/* Subtle decorative blob */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden flex justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-stone-900 flex items-center justify-center shadow-xl shadow-stone-900/20">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center lg:text-left space-y-3"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              Bienvenido de nuevo
            </h2>
            <p className="text-stone-500 text-lg">
              Ingresa a tu cuenta para continuar
            </p>
          </motion.div>

          <LoginForm />

          {/* Footer for mobile */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="lg:hidden text-center text-sm text-stone-400 pt-6"
          >
            © {new Date().getFullYear()} Bazar M&M
          </motion.p>
        </div>
      </div>
    </div>
  );
}
