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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones
      if (!proveedor_id) {
        throw new Error('Selecciona un proveedor');
      }
      
      if (items.length === 0) {
        throw new Error('Agrega al menos un producto');
      }
      
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
      }
      
      const result = await crearCompra(formData);
      
      if (result.success) {
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
          <h2 className="text-xl font-semibold">Cargar PDF de Orden</h2>
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
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Proveedor *
            </label>
            <select
              value={proveedor_id}
              onChange={(e) => setProveedorId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              N° de Orden
            </label>
            <input
              type="text"
              value={numero_orden}
              onChange={(e) => setNumeroOrden(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: #2527"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Método de Pago *
            </label>
            <select
              value={metodo_pago}
              onChange={(e) => setMetodoPago(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="cuenta_corriente">Cuenta Corriente</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Observaciones
            </label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={item.nombre}
                      onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Nombre del producto"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      SKU / Código
                    </label>
                    <input
                      type="text"
                      value={item.sku || item.codigo}
                      onChange={(e) => {
                        handleItemChange(index, 'sku', e.target.value);
                        handleItemChange(index, 'codigo', e.target.value);
                      }}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="SKU"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      Categoría
                    </label>
                    <select
                      value={item.categoria}
                      onChange={(e) => handleItemChange(index, 'categoria', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="Almacén">Almacén</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Limpieza">Limpieza</option>
                      <option value="Librería">Librería</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      Cant. *
                    </label>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                      required
                      min="1"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      P. Costo *
                    </label>
                    <input
                      type="number"
                      value={item.precio_costo}
                      onChange={(e) => handleItemChange(index, 'precio_costo', parseFloat(e.target.value))}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      P. Venta *
                    </label>
                    <input
                      type="number"
                      value={item.precio_venta}
                      onChange={(e) => handleItemChange(index, 'precio_venta', parseFloat(e.target.value))}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-right text-sm font-medium">
                  Subtotal: ${(item.cantidad * item.precio_costo).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-right">
              <span className="text-xl font-bold">
                Total: ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Compra'}
        </button>
      </div>
    </form>
  );
}
