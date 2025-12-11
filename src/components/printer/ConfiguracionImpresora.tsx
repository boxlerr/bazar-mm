'use client';

import { useState, useEffect } from 'react';
import * as PrinterService from '@/lib/printer/PrinterService';

export function ConfiguracionImpresora() {
  const [servidorConectado, setServidorConectado] = useState(false);
  const [impresoraConectada, setImpresoraConectada] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const verificarConexiones = async () => {
    setCargando(true);

    // Verificar servidor
    const serverStatus = await PrinterService.checkConnection();
    setServidorConectado(serverStatus);

    if (serverStatus) {
      // Verificar impresora
      const printerStatus = await PrinterService.checkPrinterStatus();
      setImpresoraConectada(printerStatus.connected);
      setMensaje(printerStatus.message || '');
    } else {
      setImpresoraConectada(false);
      setMensaje('Servidor de impresión no disponible');
    }

    setCargando(false);
  };

  const imprimirPrueba = async () => {
    const resultado = await PrinterService.imprimirTest();

    if (resultado.success) {
      alert('✅ Ticket de prueba impreso correctamente');
    } else {
      alert(`❌ Error: ${resultado.error}`);
    }
  };

  useEffect(() => {
    verificarConexiones();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          🖨️ Configuración de Impresora
        </h2>
        <button
          onClick={verificarConexiones}
          disabled={cargando}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {cargando ? 'Verificando...' : '🔄 Actualizar'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Estado del servidor */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Servidor de Impresión</h3>
            <p className="text-sm text-gray-900">http://localhost:3001</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${servidorConectado ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            <span className={`font-medium ${servidorConectado ? 'text-green-600' : 'text-red-600'
              }`}>
              {servidorConectado ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Estado de la impresora */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Impresora Gadnic TP-450s</h3>
            <p className="text-sm text-gray-900">
              {mensaje || 'Impresora térmica 80mm'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${impresoraConectada ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            <span className={`font-medium ${impresoraConectada ? 'text-green-600' : 'text-red-600'
              }`}>
              {impresoraConectada ? 'Detectada' : 'No detectada'}
            </span>
          </div>
        </div>

        {/* Botón de prueba */}
        <div className="pt-4">
          <button
            onClick={imprimirPrueba}
            disabled={!servidorConectado || !impresoraConectada}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            🧪 Imprimir Ticket de Prueba
          </button>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Instrucciones:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Conecta la impresora Gadnic TP-450s por USB</li>
            <li>Instala los drivers si es necesario</li>
            <li>Abre una terminal en la carpeta <code className="bg-blue-100 px-1 rounded">printer-server</code></li>
            <li>Ejecuta: <code className="bg-blue-100 px-2 py-1 rounded">npm install</code></li>
            <li>Inicia el servidor: <code className="bg-blue-100 px-2 py-1 rounded">npm start</code></li>
            <li>Verifica el estado aquí y prueba la impresión</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
