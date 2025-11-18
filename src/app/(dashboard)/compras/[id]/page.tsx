import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, FileText, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TablaProductosEditable from './TablaProductosEditable';

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
        producto:productos(nombre, codigo, codigo_barra, categoria),
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
    <div>
      <div className="mb-6">
        <Link
          href="/compras"
          className="flex items-center gap-2 text-gray-900 hover:text-blue-600 mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Compras
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Compra #{compra.numero_orden || compra.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600 mt-2">
              Registrada el {new Date(compra.created_at).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-bold rounded-full ${
              compra.estado === 'completada'
                ? 'bg-green-100 text-green-800'
                : compra.estado === 'pendiente'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {compra.estado.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Información del Proveedor */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Proveedor</h2>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-bold text-lg">{compra.proveedor?.nombre}</p>
            {compra.proveedor?.razon_social && (
              <p className="text-sm text-gray-600">{compra.proveedor.razon_social}</p>
            )}
            {compra.proveedor?.cuit && (
              <p className="text-sm text-gray-600">CUIT: {compra.proveedor.cuit}</p>
            )}
            {compra.proveedor?.telefono && (
              <p className="text-sm text-gray-600">Tel: {compra.proveedor.telefono}</p>
            )}
            {compra.proveedor?.email && (
              <p className="text-sm text-gray-600">Email: {compra.proveedor.email}</p>
            )}
          </div>
        </div>

        {/* Información de Pago */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Pago</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Método de Pago</p>
              <p className="text-gray-900 font-bold capitalize">{compra.metodo_pago}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Compra</p>
              <p className="text-2xl font-bold text-green-600">${formatNumber(compra.total)}</p>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Detalles</h2>
          </div>
          <div className="space-y-3">
            {compra.numero_orden && (
              <div>
                <p className="text-sm text-gray-600">N° de Orden</p>
                <p className="text-gray-900 font-bold">{compra.numero_orden}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Total de Productos</p>
              <p className="text-gray-900 font-bold">{compra.items?.length || 0} items</p>
            </div>
            {compra.pdf_url && (
              <a
                href={compra.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <FileText className="w-4 h-4" />
                Ver PDF Original
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Observaciones */}
      {compra.observaciones && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-yellow-800">Observaciones</p>
              <p className="text-sm text-yellow-700 mt-1">{compra.observaciones}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Productos - Editable */}
      <TablaProductosEditable 
        items={compra.items || []}
        compraId={compra.id}
        total={compra.total}
      />
    </div>
  );
}
