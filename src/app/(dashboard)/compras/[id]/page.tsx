import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, FileText, User, CreditCard, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TablaProductosEditable from './TablaProductosEditable';
import { PurchaseActions } from './PurchaseActions';
import * as motion from 'framer-motion/client';

export const metadata: Metadata = {
  title: 'Detalle de Compra | Bazar M&M',
  description: 'Ver detalles de la compra',
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetalleCompraPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Obtener compra con items y proveedor
  const { data: compra, error } = await supabase
    .from('compras')
    .select(`
      *,
      proveedor:proveedores(nombre, razon_social, cuit, telefono, email),
      items:compra_items(
        id,
        producto:productos(nombre, codigo, codigo_barra, categoria, units_per_pack),
        cantidad,
        precio_unitario,
        subtotal
      )
    `)
    .eq('id', id)
    .single();

  if (error || !compra) {
    notFound();
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto pb-10"
    >
      <div className="mb-6 md:mb-8">
        <Link
          href="/compras"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4 md:mb-6 font-medium transition-colors text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Compras
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight break-all sm:break-normal">
                Compra #{compra.numero_orden || compra.id.slice(0, 8)}
              </h1>
              <span
                className={`self-start sm:self-auto px-2.5 py-0.5 md:px-3 md:py-1 text-xs md:text-sm font-bold rounded-full border ${compra.estado === 'completada'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : compra.estado === 'pendiente'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                  }`}
              >
                {compra.estado.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm md:text-base">
              <Calendar className="w-4 h-4" />
              <p>
                Registrada el {new Date(compra.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <PurchaseActions id={compra.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Información del Proveedor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3 md:mb-4 border-b border-gray-100 pb-3 md:pb-4">
            <div className="bg-blue-50 p-2 md:p-2.5 rounded-lg">
              <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Proveedor</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold mb-0.5 md:mb-1">Nombre</p>
              <p className="text-gray-900 font-bold text-base md:text-lg">{compra.proveedor?.nombre}</p>
            </div>
            {compra.proveedor?.razon_social && (
              <div>
                <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold mb-0.5 md:mb-1">Razón Social</p>
                <p className="text-sm text-gray-700">{compra.proveedor.razon_social}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {compra.proveedor?.cuit && (
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold mb-0.5 md:mb-1">CUIT</p>
                  <p className="text-xs md:text-sm text-gray-700 font-mono">{compra.proveedor.cuit}</p>
                </div>
              )}
              {compra.proveedor?.telefono && (
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold mb-0.5 md:mb-1">Teléfono</p>
                  <p className="text-xs md:text-sm text-gray-700">{compra.proveedor.telefono}</p>
                </div>
              )}
            </div>
            {compra.proveedor?.email && (
              <div>
                <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold mb-0.5 md:mb-1">Email</p>
                <p className="text-xs md:text-sm text-gray-700 truncate">{compra.proveedor.email}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Información de Pago */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3 md:mb-4 border-b border-gray-100 pb-3 md:pb-4">
            <div className="bg-green-50 p-2 md:p-2.5 rounded-lg">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Pago</h2>
          </div>
          <div className="space-y-3 md:space-y-4">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold mb-0.5 md:mb-1">Método de Pago</p>
              <p className="text-gray-900 font-bold capitalize flex items-center gap-2 text-sm md:text-base">
                {compra.metodo_pago}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 md:p-4 border border-green-100">
              <p className="text-xs md:text-sm text-green-700 font-medium mb-0.5 md:mb-1">Total de Compra</p>
              <p className="text-2xl md:text-3xl font-bold text-green-700">${formatNumber(compra.total)}</p>
            </div>
          </div>
        </motion.div>

        {/* Información Adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3 md:mb-4 border-b border-gray-100 pb-3 md:pb-4">
            <div className="bg-purple-50 p-2 md:p-2.5 rounded-lg">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Detalles</h2>
          </div>
          <div className="space-y-3 md:space-y-4">
            {compra.numero_orden && (
              <div>
                <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold mb-0.5 md:mb-1">N° de Orden</p>
                <p className="text-gray-900 font-bold text-sm md:text-base">{compra.numero_orden}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold mb-0.5 md:mb-1">Total de Productos</p>
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                <p className="text-gray-900 font-bold text-sm md:text-base">{compra.items?.length || 0} items</p>
              </div>
            </div>
            {compra.pdf_url && (
              <div className="pt-2">
                <a
                  href={compra.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-4 py-2 rounded-lg transition-colors w-full justify-center text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Ver PDF Original
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Observaciones */}
      {compra.observaciones && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-8 flex gap-3"
        >
          <div className="flex-shrink-0 mt-0.5">
            <div className="bg-yellow-100 p-1.5 rounded-full">
              <FileText className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-yellow-800 mb-1">Observaciones</p>
            <p className="text-sm text-yellow-700 leading-relaxed">{compra.observaciones}</p>
          </div>
        </motion.div>
      )}

      {/* Lista de Productos - Editable */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <TablaProductosEditable
          items={compra.items || []}
          compraId={compra.id}
          total={compra.total}
        />
      </motion.div>
    </motion.div>
  );
}
