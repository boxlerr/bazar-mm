'use client';

import Link from 'next/link';
import { obtenerCompras } from './actions';
import {
  FileText,
  Calendar,
  DollarSign,
  Package,
  Plus,
  TrendingUp,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import TablaCompras from './tabla';
import { motion } from 'framer-motion';

export default function ComprasPage() {
  const [compras, setCompras] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      const data = await obtenerCompras();
      setCompras(data);
      setCargando(false);
    };
    cargarDatos();
  }, []);

  const stats = [
    {
      label: 'Total Compras',
      value: compras.length,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      label: 'Total Invertido',
      value: `$${compras.reduce((sum, c) => sum + c.total, 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100'
    },
    {
      label: 'Productos Ingresados',
      value: compras.reduce((sum, c) => sum + (c.items?.length || 0), 0),
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Compras</h1>
          <p className="text-gray-500 mt-1 text-lg">
            Gestión de compras y reposición de stock
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/compras/nueva"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-blue-600/20 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Compra</span>
          </Link>
        </motion.div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-sm p-6 border ${stat.border} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm mt-1 font-medium">{stat.label}</div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabla de compras */}
      {cargando ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando compras...</p>
        </div>
      ) : compras.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 mb-4 font-medium text-lg">No hay compras registradas</p>
          <Link
            href="/compras/nueva"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition font-medium shadow-lg shadow-blue-600/20"
          >
            Registrar Primera Compra
          </Link>
        </div>
      ) : (
        <TablaCompras compras={compras} />
      )}
    </motion.div>
  );
}
