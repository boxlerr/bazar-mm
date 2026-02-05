'use client';

import { Metadata } from 'next';
import LoginForm from './form';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-neutral-50 overflow-hidden font-sans">
      {/* Left Side - Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-900 shadow-2xl">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/login-bg.png"
            alt="Business Context"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/20 to-neutral-950/80 z-10" />
        </motion.div>

        {/* Decorative Light Rays or Streaks could be added here if needed */}

        <div className="relative z-30 flex flex-col justify-between w-full p-16 text-white h-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-xl">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain filter brightness-110"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                Bazar M&M
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-bold">
                Premium Management
              </span>
            </div>
          </motion.div>

          <div className="space-y-6 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <h1 className="text-7xl font-black leading-[1.05] tracking-tighter mb-4">
                Gestión <br />
                <span className="text-red-500 italic">inteligente</span> <br />
                para tu negocio.
              </h1>
              <div className="h-1.5 w-24 bg-red-600 rounded-full mb-8 shadow-lg shadow-red-600/50" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-xl text-neutral-300 leading-relaxed font-light max-w-md"
            >
              Controla tu inventario, ventas y facturación desde una única plataforma diseñada para el máximo rendimiento.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-6 text-sm text-neutral-400"
          >
            <span className="font-mono">© {new Date().getFullYear()}</span>
            <span className="w-1 h-1 rounded-full bg-red-600/50" />
            <a
              href="https://vaxler.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition-all duration-300 group flex items-center gap-2"
            >
              <span className="group-hover:tracking-wider transition-all">Desarrollado por Vaxler</span>
              <div className="w-0 group-hover:w-4 h-[1px] bg-red-500 transition-all" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-40">
          <div className="w-[500px] h-[500px] bg-red-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="absolute bottom-0 left-0 p-8 pointer-events-none opacity-20">
          <div className="w-64 h-64 bg-neutral-100 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="w-full max-w-[440px] space-y-12 relative z-10">
          <div className="text-center lg:text-left space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:hidden flex justify-center mb-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/10 blur-2xl rounded-full" />
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-20 h-20 object-contain relative z-10"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl font-extrabold tracking-tight text-neutral-900 mb-2">
                Bienvenido
              </h2>
              <p className="text-neutral-500 text-lg font-medium">
                Ingresa tus credenciales para continuar.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LoginForm />
          </motion.div>
        </div>
      </div>
    </div >
  );
}
