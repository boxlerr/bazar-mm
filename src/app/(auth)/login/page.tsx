'use client';

import { Metadata } from 'next';
import LoginForm from './form';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-neutral-50 overflow-hidden">
      {/* Left Side - Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-neutral-900/90 z-20" />

        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 z-10"
        >
          <div className="absolute inset-0 bg-neutral-900" />
        </motion.div>

        <div className="relative z-30 flex flex-col justify-between w-full p-12 text-white h-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 backdrop-blur-sm border border-white/10">
              <span className="font-bold text-2xl">M</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">Bazar M&M</span>
          </motion.div>

          <div className="space-y-8 max-w-lg">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-6xl font-bold leading-tight tracking-tight"
            >
              Gestión <span className="text-red-500">inteligente</span> para tu negocio.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-xl text-neutral-300 leading-relaxed font-light"
            >
              Controla tu inventario, ventas y facturación desde una única plataforma optimizada para el crecimiento exponencial.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-6 text-sm text-neutral-400"
          >
            <span>© {new Date().getFullYear()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <a
              href="https://vaxler.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors hover:underline"
            >
              Desarrollado por Vaxler
            </a>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-50 pointer-events-none">
          <div className="w-64 h-64 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="w-full max-w-[420px] space-y-10 relative z-10">
          <div className="text-center lg:text-left space-y-3">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30">
                <span className="font-bold text-3xl text-white">M</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-neutral-900">
              Bienvenido
            </h2>
            <p className="text-neutral-500 text-lg">
              Ingresa tus credenciales para acceder.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div >
  );
}
