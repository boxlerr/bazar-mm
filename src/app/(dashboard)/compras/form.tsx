'use client';

import { useState, useRef, useEffect } from 'react';
import { CompraItemForm, PDFParseResult } from '@/types/compra';
import { Upload, FileText, Trash2, Plus, Check, X, AlertCircle } from 'lucide-react';
import { crearCompra } from './actions';
import { useRouter } from 'next/navigation';

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
      
      console.log('📤 Enviando PDF al servidor...');
      
      const response = await fetch('/api/compras/pdf', {
        method: 'POST',
        body: formData,
      });
      
      console.log('📥 Respuesta recibida:', response.status, response.statusText);
      
      // Verificar si la respuesta es JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Respuesta no es JSON:', text.substring(0, 200));
        throw new Error('El servidor devolvió una respuesta inválida. Verifica los logs del servidor.');
      }
      
      const result = await response.json();
      console.log('📦 Datos parseados:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Error procesando PDF');
      }
      
      // Procesar datos extraídos
      const pdfData: PDFParseResult = result.data;
      
      // Autocompletar campos
      if (pdfData.numero_orden) {
        setNumeroOrden(pdfData.numero_orden);
      }
      
      // Convertir productos extraídos a items del formulario
      const newItems: CompraItemForm[] = pdfData.productos.map(p => ({
        nombre: p.nombre,
        sku: p.sku,
        codigo: p.sku || '', // Usar SKU como código por defecto
        categoria: 'Almacén', // Categoría por defecto
        cantidad: p.cantidad,
        precio_costo: p.precio_unitario,
        precio_venta: Math.round(p.precio_unitario * 1.5), // Margen del 50%
        es_nuevo: true, // Asumir que son nuevos, luego se verificará
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
    
    // Calcular precio de venta automáticamente si cambia el costo
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
      console.log('🔄 Iniciando guardado de compra...');
      
      // Validaciones
      if (!proveedor_id) {
        throw new Error('Selecciona un proveedor');
      }
      
      if (items.length === 0) {
        throw new Error('Agrega al menos un producto');
      }
      
      console.log('✅ Validaciones pasadas');
      console.log('📦 Items:', items.length);
      console.log('💰 Total:', calculateTotal());
      
      // Crear FormData
      const formData = new FormData();
      formData.append('proveedor_id', proveedor_id);
      formData.append('numero_orden', numero_orden);
      formData.append('metodo_pago', metodo_pago);
      formData.append('observaciones', observaciones);
      formData.append('total', calculateTotal().toString());
      formData.append('items', JSON.stringify(items));
      
      if (pdfFile) {
        formData.append('pdf', pdfFile);
        console.log('📄 PDF adjunto:', pdfFile.name);
      }
      
      console.log('🚀 Enviando a server action...');
      const result = await crearCompra(formData);
      console.log('📥 Resultado:', result);
      
      if (result.success) {
        console.log('✅ Compra creada exitosamente');
        // Usar push en lugar de back para evitar problemas de sesión
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>PDF procesado exitosamente</span>
        </div>
      )}

      {/* Carga de PDF */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Cargar PDF de Orden</h2>
          <span className="text-sm text-blue-600 font-medium">(Opcional)</span>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePDFUpload}
            className="hidden"
          />
          
          {!pdfFile ? (
            <>
              <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                Arrastra un PDF aquí o haz clic para seleccionar
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processingPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {processingPDF ? 'Procesando...' : 'Seleccionar PDF'}
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="text-left">
                <p className="font-bold text-gray-900">{pdfFile.name}</p>
                <p className="text-sm text-gray-900">
                  {(pdfFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-red-600 hover:text-red-700"
                title="Quitar PDF (los productos permanecerán)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-800">
          <p>💡 También puedes agregar productos manualmente sin PDF</p>
        </div>
      </div>

      {/* Información de la compra */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Información de la Compra</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Proveedor *
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <select
                  value={proveedor_id}
                  onChange={(e) => setProveedorId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" className="text-gray-500">Seleccionar proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id} className="text-gray-900">{p.nombre}</option>
                  ))}
                </select>
                {proveedor_id && (
                  <button
                    type="button"
                    onClick={() => handleEliminarProveedor(proveedor_id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 bg-white px-2"
                    title="Eliminar proveedor seleccionado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowProveedorModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
                title="Agregar nuevo proveedor"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              N° de Orden
            </label>
            <input
              type="text"
              value={numero_orden}
              onChange={(e) => setNumeroOrden(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: #2527"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Método de Pago *
            </label>
            <select
              value={metodo_pago}
              onChange={(e) => setMetodoPago(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="cuenta_corriente">Cuenta Corriente</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Observaciones
            </label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales"
            />
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Productos</h2>
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Producto
          </button>
        </div>
        
        {items.length === 0 ? (
          <p className="text-gray-800 text-center py-8">
            No hay productos. Carga un PDF o agrega productos manualmente.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 hover:border-blue-400 transition">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={item.nombre}
                      onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del producto"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      SKU / Código
                    </label>
                    <input
                      type="text"
                      value={item.sku || item.codigo}
                      onChange={(e) => {
                        handleItemChange(index, 'sku', e.target.value);
                        handleItemChange(index, 'codigo', e.target.value);
                      }}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SKU123"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Categoría
                    </label>
                    <select
                      value={item.categoria}
                      onChange={(e) => handleItemChange(index, 'categoria', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Almacén">Almacén</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Limpieza">Limpieza</option>
                      <option value="Librería">Librería</option>
                      <option value="Bazar">Bazar</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Cant. *
                    </label>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                      required
                      min="1"
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Precio Costo *
                    </label>
                    <input
                      type="number"
                      value={item.precio_costo}
                      onChange={(e) => handleItemChange(index, 'precio_costo', parseFloat(e.target.value))}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Precio Venta *
                    </label>
                    <input
                      type="number"
                      value={item.precio_venta}
                      onChange={(e) => handleItemChange(index, 'precio_venta', parseFloat(e.target.value))}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition shadow-md hover:shadow-lg"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between items-center">
                  <span className="text-xs text-gray-600">Producto #{index + 1}</span>
                  <span className="text-sm font-bold text-gray-900">
                    Subtotal: <span className="text-blue-600">${formatNumber(item.cantidad * item.precio_costo)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                Total: <span className="text-green-600">${formatNumber(calculateTotal())}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/compras')}
          className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-900 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-md hover:shadow-lg"
        >
          {loading ? 'Guardando...' : 'Guardar Compra'}
        </button>
      </div>

      {/* Modal Nuevo Proveedor */}
      {showProveedorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nuevo Proveedor</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Nombre *</label>
                <input
                  type="text"
                  value={nuevoProveedor.nombre}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, nombre: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del proveedor"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Razón Social</label>
                <input
                  type="text"
                  value={nuevoProveedor.razon_social}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, razon_social: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Razón Social S.A."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">CUIT</label>
                <input
                  type="text"
                  value={nuevoProveedor.cuit}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, cuit: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="20-12345678-9"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Teléfono</label>
                <input
                  type="text"
                  value={nuevoProveedor.telefono}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  value={nuevoProveedor.email}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, email: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="proveedor@email.com"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowProveedorModal(false);
                  setNuevoProveedor({ nombre: '', razon_social: '', cuit: '', telefono: '', email: '' });
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-900 font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrearProveedor}
                disabled={!nuevoProveedor.nombre}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                Crear Proveedor
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
