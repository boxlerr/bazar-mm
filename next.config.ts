import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Configuración para pdf-parse y canvas (Next.js 16+)
  serverExternalPackages: ['pdf-parse', 'canvas', '@napi-rs/canvas'],
  
  // Configuración de Turbopack para Next.js 16
  turbopack: {
    // Configuración vacía para usar Turbopack con módulos externos
  },
};

export default nextConfig;
