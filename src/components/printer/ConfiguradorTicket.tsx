'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, Building2, Ruler, Package, CheckCircle2, AlertCircle } from 'lucide-react';

interface TicketConfig {
  empresa: {
    nombre: string;
    direccion: string;
    telefono: string;
    cuit: string;
  };
  formato: {
    anchoLinea: number;
    alinearEncabezado: 'izquierda' | 'centro' | 'derecha';
    mostrarCuit: boolean;
    separadorPrincipal: string;
    separadorSecundario: string;
  };
  productos: {
    anchoNombre: number;
    anchoCantidad: number;
    anchoPrecio: number;
    mostrarPrecioUnitario: boolean;
  };
}

const CONFIG_DEFAULT: TicketConfig = {
  empresa: {
    nombre: 'BAZAR M&M',
    direccion: 'Calle Principal 123, Buenos Aires',
    telefono: '(011) 1234-5678',
    cuit: '20-12345678-9'
  },
  formato: {
    anchoLinea: 48,
    alinearEncabezado: 'centro',
    mostrarCuit: true,
    separadorPrincipal: '=',
    separadorSecundario: '-'
  },
  productos: {
    anchoNombre: 20,
    anchoCantidad: 6,
    anchoPrecio: 12,
    mostrarPrecioUnitario: false
  }
};

export function ConfiguradorTicket() {
  const [config, setConfig] = useState<TicketConfig>(CONFIG_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Inicializar config desde localStorage solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const configGuardada = localStorage.getItem('ticket_config');
      if (configGuardada) {
        setConfig(JSON.parse(configGuardada));
      }
    }
  }, []);

  const guardarConfiguracion = async () => {
    setGuardando(true);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('ticket_config', JSON.stringify(config));
    }
    
    try {
      const response = await fetch('http://localhost:3001/configuracion/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setMensaje({ tipo: 'success', texto: 'Configuración guardada correctamente' });
      } else {
        setMensaje({ tipo: 'success', texto: 'Configuración guardada localmente' });
      }
    } catch {
      setMensaje({ tipo: 'success', texto: 'Configuración guardada localmente' });
    }
    
    setGuardando(false);
    setTimeout(() => setMensaje(null), 3000);
  };

  const generarVistaPrevia = () => {
    const linea = (char: string) => char.repeat(config.formato.anchoLinea);
    const centrar = (texto: string) => {
      const espacios = Math.max(0, Math.floor((config.formato.anchoLinea - texto.length) / 2));
      return ' '.repeat(espacios) + texto;
    };
    const alinearDerecha = (texto: string) => {
      const espacios = Math.max(0, config.formato.anchoLinea - texto.length);
      return ' '.repeat(espacios) + texto;
    };

    let preview = '\n\n';
    
    if (config.formato.alinearEncabezado === 'centro') {
      preview += centrar(config.empresa.nombre) + '\n';
      preview += centrar(config.empresa.direccion) + '\n';
      preview += centrar(config.empresa.telefono) + '\n';
      if (config.formato.mostrarCuit) {
        preview += centrar(`CUIT: ${config.empresa.cuit}`) + '\n';
      }
    } else {
      preview += config.empresa.nombre + '\n';
      preview += config.empresa.direccion + '\n';
      preview += config.empresa.telefono + '\n';
      if (config.formato.mostrarCuit) {
        preview += `CUIT: ${config.empresa.cuit}\n`;
      }
    }
    
    preview += linea(config.formato.separadorSecundario) + '\n';
    preview += 'Ticket: 0001\n';
    preview += `Fecha: ${new Date().toLocaleString('es-AR')}\n`;
    preview += 'Cajero: Sistema\n';
    preview += linea(config.formato.separadorPrincipal) + '\n';
    
    const headerProducto = 'PRODUCTO'.padEnd(config.productos.anchoNombre);
    const headerCant = 'CANT'.padStart(config.productos.anchoCantidad);
    const headerPrecio = 'PRECIO'.padStart(config.productos.anchoPrecio);
    preview += headerProducto + headerCant + headerPrecio + '\n';
    preview += linea(config.formato.separadorPrincipal) + '\n';
    
    const ejemplos = [
      { nombre: 'Producto A', cantidad: 2, precio: 1600 },
      { nombre: 'Producto B', cantidad: 3, precio: 900 }
    ];
    
    ejemplos.forEach(item => {
      const nombre = item.nombre.substring(0, config.productos.anchoNombre).padEnd(config.productos.anchoNombre);
      const cantidad = String(item.cantidad).padStart(config.productos.anchoCantidad);
      const precio = `$${item.precio.toFixed(2)}`.padStart(config.productos.anchoPrecio);
      preview += nombre + cantidad + precio + '\n';
    });
    
    preview += linea(config.formato.separadorPrincipal) + '\n';
    preview += alinearDerecha('Subtotal: $2500.00') + '\n';
    preview += '\n';
    preview += alinearDerecha('TOTAL: $2500.00') + '\n';
    preview += linea(config.formato.separadorSecundario) + '\n';
    preview += centrar('Metodo: EFECTIVO') + '\n';
    preview += linea(config.formato.separadorPrincipal) + '\n';
    preview += centrar('Gracias por su compra!') + '\n';
    preview += centrar('www.bazarmym.com') + '\n';
    preview += '\n\n\n';
    
    return preview;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Configuración de Tickets</h1>
          <p className="text-slate-600">Personaliza el formato y diseño de tus tickets de impresión</p>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fadeIn ${
            mensaje.tipo === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {mensaje.tipo === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-medium">{mensaje.texto}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Configuración */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5" />
                Configuración
              </h2>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Datos de la Empresa */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Datos de la Empresa</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={config.empresa.nombre}
                    onChange={(e) => setConfig({...config, empresa: {...config.empresa, nombre: e.target.value}})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nombre del negocio"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={config.empresa.direccion}
                    onChange={(e) => setConfig({...config, empresa: {...config.empresa, direccion: e.target.value}})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Dirección completa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={config.empresa.telefono}
                    onChange={(e) => setConfig({...config, empresa: {...config.empresa, telefono: e.target.value}})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="(011) 1234-5678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CUIT</label>
                  <input
                    type="text"
                    value={config.empresa.cuit}
                    onChange={(e) => setConfig({...config, empresa: {...config.empresa, cuit: e.target.value}})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="20-12345678-9"
                  />
                </div>
              </div>

              {/* Formato */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <Ruler className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Formato</h3>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">Ancho de línea</label>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {config.formato.anchoLinea} caracteres
                    </span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="64"
                    value={config.formato.anchoLinea}
                    onChange={(e) => setConfig({...config, formato: {...config.formato, anchoLinea: parseInt(e.target.value)}})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>32</span>
                    <span>48</span>
                    <span>64</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Alineación del encabezado</label>
                  <select
                    value={config.formato.alinearEncabezado}
                    onChange={(e) => setConfig({...config, formato: {...config.formato, alinearEncabezado: e.target.value as 'izquierda' | 'centro' | 'derecha'}})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="izquierda">Izquierda</option>
                    <option value="centro">Centro</option>
                    <option value="derecha">Derecha</option>
                  </select>
                </div>
                
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.formato.mostrarCuit}
                    onChange={(e) => setConfig({...config, formato: {...config.formato, mostrarCuit: e.target.checked}})}
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Mostrar CUIT en el ticket</span>
                </label>
              </div>

              {/* Productos */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Columnas de Productos</h3>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">Ancho columna nombre</label>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {config.productos.anchoNombre}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="30"
                    value={config.productos.anchoNombre}
                    onChange={(e) => setConfig({...config, productos: {...config.productos, anchoNombre: parseInt(e.target.value)}})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">Ancho columna cantidad</label>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {config.productos.anchoCantidad}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    value={config.productos.anchoCantidad}
                    onChange={(e) => setConfig({...config, productos: {...config.productos, anchoCantidad: parseInt(e.target.value)}})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">Ancho columna precio</label>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {config.productos.anchoPrecio}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="15"
                    value={config.productos.anchoPrecio}
                    onChange={(e) => setConfig({...config, productos: {...config.productos, anchoPrecio: parseInt(e.target.value)}})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <button
                onClick={guardarConfiguracion}
                disabled={guardando}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {guardando ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa
              </h2>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-900 rounded-lg p-6 overflow-auto shadow-inner max-h-[calc(100vh-300px)]">
                <pre className="font-mono text-xs leading-relaxed text-green-400 whitespace-pre">
                  {generarVistaPrevia()}
                </pre>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong className="font-semibold">💡 Sugerencia:</strong> Ajusta los valores hasta que el ticket se vea perfecto. 
                  Los cambios se aplicarán automáticamente a todas las impresiones futuras.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
