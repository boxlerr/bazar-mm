'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, AlertTriangle, DollarSign, Grid3x3, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import TablaStock from './table';
import { Producto } from '@/types/producto';
import { createClient } from '@/lib/supabase/client';

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const filter = searchParams.get('filter');

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('nombre');

    if (data) {
      setProductos(data);
    }
    setLoading(false);
  };

  const calcularEstadisticas = () => {
    const totalProductos = productos.length;
    const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
    const valorTotal = productos.reduce((sum, p) => sum + (p.stock_actual * p.precio_venta), 0);
    const categorias = new Set(productos.map(p => p.categoria)).size;

    return { totalProductos, stockBajo, valorTotal, categorias };
  };

  const stats = calcularEstadisticas();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleStatClick = (statTitle: string) => {
    if (statTitle === 'Stock Bajo') {
      router.push('/stock?filter=low_stock');
    } else if (statTitle === 'Total Productos') {
      router.push('/stock');
    }
  };

  const filteredProductos = filter === 'low_stock'
    ? productos.filter(p => p.stock_actual <= p.stock_minimo)
    : productos;

  const estadisticas = [
    {
      titulo: 'Total Productos',
      valor: stats.totalProductos,
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valorColor: 'text-blue-700',
      clickable: true,
    },
    {
      titulo: 'Stock Bajo',
      valor: stats.stockBajo,
      icon: AlertTriangle,
      color: 'red',
      bgColor: filter === 'low_stock' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-red-50',
      iconColor: 'text-red-600',
      valorColor: 'text-red-700',
      alerta: stats.stockBajo > 0,
      clickable: true,
    },
    {
      titulo: 'Valor Inventario',
      valor: `$${formatNumber(stats.valorTotal)}`,
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      valorColor: 'text-green-700',
    },
    {
      titulo: 'Categorías',
      valor: stats.categorias,
      icon: Grid3x3,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      valorColor: 'text-purple-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3"
          >
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
            Stock e Inventario
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 mt-2"
          >
            Gestiona tu inventario y productos
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href="/stock/nuevo"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-blue-600/20 hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </Link>
        </motion.div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticas.map((stat, index) => (
          <motion.div
            key={stat.titulo}
            onClick={() => stat.clickable && handleStatClick(stat.titulo)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            className={`${stat.bgColor} rounded-xl p-6 border border-${stat.color}-100 hover:shadow-md transition-all ${stat.clickable ? 'cursor-pointer' : ''} group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {stat.alerta && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full border border-red-200 animate-pulse">
                  ¡Alerta!
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                {stat.titulo}
              </p>
              <p className={`text-3xl font-bold ${stat.valorColor}`}>
                {stat.valor}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabla de productos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <TablaStock productos={filteredProductos} />
      </motion.div>
    </motion.div>
  );
}
