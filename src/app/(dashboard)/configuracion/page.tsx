import { Metadata } from 'next';
import Link from 'next/link';
import { Settings, Receipt, Download, Building2, Shield, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Configuración | Bazar M&M',
  description: 'Configuración general del sistema',
};

const configSections = [
  {
    icon: Receipt,
    title: 'Configuración de Tickets',
    description: 'Personaliza el formato y diseño de tus tickets de impresión',
    href: '/configuracion/ticket',
    color: 'from-blue-500 to-blue-600',
    badge: 'Nuevo'
  },
  {
    icon: Building2,
    title: 'Información del Negocio',
    description: 'Datos de contacto, dirección y configuración general',
    href: '/configuracion/empresa',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Shield,
    title: 'Seguridad y Permisos',
    description: 'Gestión de roles, usuarios y accesos al sistema',
    href: '/usuarios',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Configura alertas de stock, ventas y reportes',
    href: '/configuracion/notificaciones',
    color: 'from-orange-500 to-orange-600'
  }
];

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
              <p className="text-slate-600">Personaliza y gestiona tu sistema</p>
            </div>
          </div>
        </div>

        {/* Grid de secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {configSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              >
                {section.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {section.badge}
                    </span>
                  </div>
                )}
                
                <div className={`h-2 bg-gradient-to-r ${section.color}`} />
                
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-r ${section.color} rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Backup Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5" />
              Backup y Respaldo
            </h2>
          </div>
          
          <div className="p-6">
            <p className="text-slate-600 mb-4">
              Descarga una copia de seguridad completa de tu base de datos. 
              Se recomienda realizar backups periódicos para proteger tu información.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                <Download className="w-5 h-5" />
                Descargar Backup Completo
              </button>
              
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all">
                <Shield className="w-5 h-5" />
                Configurar Backup Automático
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong className="font-semibold">⚠️ Importante:</strong> Guarda tus backups en un lugar seguro externo a este servidor.
                La última copia de seguridad se realizó hace 3 días.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
