'use client';

import { useState, useRef, useEffect } from 'react';
import { CompraItemForm, PDFParseResult } from '@/types/compra';
import { Upload, FileText, Trash2, Plus, Check, X, AlertCircle, Save, ArrowLeft, Loader2, Search } from 'lucide-react';
import { crearCompra } from './actions';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Proveedor {
  id: string;
  nombre: string;
}

export default function CompraForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [processingPDF, setProcessingPDF] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre: '', razon_social: '', cuit: '', telefono: '', email: '' });

  // Datos del formulario
  const [proveedor_id, setProveedorId] = useState('');
  const [numero_orden, setNumeroOrden] = useState('');
  const [metodo_pago, setMetodoPago] = useState('efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Items de la compra
  const [items, setItems] = useState<CompraItemForm[]>([]);

  // Alertas y errores
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar proveedores al montar
  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores');
      if (response.ok) {
        const data = await response.json();
        setProveedores(data);
      }
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const handleCrearProveedor = async () => {
    try {
      const response = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProveedor),
      });
      if (response.ok) {
        const data = await response.json();
        await loadProveedores();
        setProveedorId(data.id);
        setShowProveedorModal(false);
        setNuevoProveedor({ nombre: '', razon_social: '', cuit: '', telefono: '', email: '' });
      }
    } catch (error) {
      console.error('Error creando proveedor:', error);
    }
  };

  const handleEliminarProveedor = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;

    try {
      const response = await fetch(`/api/proveedores?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadProveedores();
        if (proveedor_id === id) {
          setProveedorId('');
        }
      }
    } catch (error) {
      console.error('Error eliminando proveedor:', error);
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setProcessingPDF(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/compras/pdf', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('El servidor devolvió una respuesta inválida.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Error procesando PDF');
      }

      const pdfData: PDFParseResult = result.data;

      if (pdfData.numero_orden) {
        setNumeroOrden(pdfData.numero_orden);
      }

      const newItems: CompraItemForm[] = pdfData.productos.map(p => ({
        nombre: p.nombre,
        sku: p.sku,
        codigo: p.sku || '',
        categoria: 'Almacén',
        cantidad: p.cantidad,
        precio_costo: p.precio_unitario,
        precio_venta: Math.round(p.precio_unitario * 1.5),
        es_nuevo: true,
      }));

      setItems(newItems);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error procesando PDF');
    } finally {
      setProcessingPDF(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, {
      nombre: '',
      codigo: '',
      categoria: 'Almacén',
      cantidad: 1,
      precio_costo: 0,
      precio_venta: 0,
      es_nuevo: true,
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CompraItemForm, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'precio_costo' && typeof value === 'number') {
      newItems[index].precio_venta = Math.round(value * 1.5);
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.cantidad * item.precio_costo), 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!proveedor_id) throw new Error('Selecciona un proveedor');
      if (items.length === 0) throw new Error('Agrega al menos un producto');

      const formData = new FormData();
      formData.append('proveedor_id', proveedor_id);
      formData.append('numero_orden', numero_orden);
      formData.append('metodo_pago', metodo_pago);
      formData.append('observaciones', observaciones);
      formData.append('total', calculateTotal().toString());
      formData.append('items', JSON.stringify(items));

      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      const result = await crearCompra(formData);

      if (result.success) {
        router.push('/compras');
        router.refresh();
      } else {
        throw new Error(result.error || 'Error al crear la compra');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6 max-w-5xl mx-auto pb-20"
    >
      {/* Alertas */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 overflow-hidden"
          >
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>PDF procesado exitosamente</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: PDF y Datos Generales */}
        <div className="lg:col-span-1 space-y-6">
          {/* Carga de PDF */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Importar Orden</h2>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">Opcional</span>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${pdfFile ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />

              {!pdfFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer"
                >
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Cargar PDF</p>
                  <p className="text-xs text-gray-500">Arrastra o selecciona un archivo</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                    <FileText className="w-8 h-8 text-red-500" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{pdfFile.name}</p>
                      <p className="text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {processingPDF && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Información General */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Datos de la Compra</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={proveedor_id}
                      onChange={(e) => setProveedorId(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                    >
                      <option value="">Seleccionar...</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProveedorModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                    title="Nuevo Proveedor"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° de Orden</label>
                <input
                  type="text"
                  value={numero_orden}
                  onChange={(e) => setNumeroOrden(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  placeholder="#12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
                <select
                  value={metodo_pago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cuenta_corriente">Cuenta Corriente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Productos
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{items.length}</span>
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                Agregar Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-900 font-medium">No hay productos agregados</p>
                <p className="text-sm">Carga un PDF o agrega productos manualmente</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-5">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Producto</label>
                          <input
                            type="text"
                            value={item.nombre}
                            onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nombre del producto"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">SKU / Código</label>
                          <input
                            type="text"
                            value={item.sku || item.codigo}
                            onChange={(e) => {
                              handleItemChange(index, 'sku', e.target.value);
                              handleItemChange(index, 'codigo', e.target.value);
                            }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="SKU123"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-4">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                          <select
                            value={item.categoria}
                            onChange={(e) => handleItemChange(index, 'categoria', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Almacén">Almacén</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Limpieza">Limpieza</option>
                            <option value="Librería">Librería</option>
                            <option value="Bazar">Bazar</option>
                            <option value="Otros">Otros</option>
                          </select>
                        </div>

                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Cant.</label>
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                            required
                            min="1"
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="col-span-4 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Costo Unit.</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1.5 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              value={item.precio_costo}
                              onChange={(e) => handleItemChange(index, 'precio_costo', parseFloat(e.target.value))}
                              required
                              min="0"
                              step="0.01"
                              className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="col-span-4 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Precio Venta</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1.5 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              value={item.precio_venta}
                              onChange={(e) => handleItemChange(index, 'precio_venta', parseFloat(e.target.value))}
                              required
                              min="0"
                              step="0.01"
                              className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="col-span-12 md:col-span-4 flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0">
                          <div className="text-right">
                            <span className="text-xs text-gray-500 block">Subtotal</span>
                            <span className="text-sm font-bold text-gray-900">${formatNumber(item.cantidad * item.precio_costo)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-end items-end gap-2">
                  <span className="text-gray-500 font-medium mb-1">Total Compra:</span>
                  <span className="text-3xl font-bold text-gray-900">${formatNumber(calculateTotal())}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Fijo para Acciones */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.push('/compras')}
            className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Compra
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Nuevo Proveedor */}
      <AnimatePresence>
        {showProveedorModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Nuevo Proveedor</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={nuevoProveedor.nombre}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                  <input
                    type="text"
                    value={nuevoProveedor.razon_social}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, razon_social: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Razón Social S.A."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
                    <input
                      type="text"
                      value={nuevoProveedor.cuit}
                      onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, cuit: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="20-12345678-9"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={nuevoProveedor.telefono}
                      onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+54 11..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={nuevoProveedor.email}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="proveedor@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowProveedorModal(false);
                    setNuevoProveedor({ nombre: '', razon_social: '', cuit: '', telefono: '', email: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCrearProveedor}
                  disabled={!nuevoProveedor.nombre}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  Crear Proveedor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
