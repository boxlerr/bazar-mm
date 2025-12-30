'use client';

import { Usuario, PERMISOS_POR_ROL, PermisosUsuario } from '@/types/usuario';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Check,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface UsuarioFormProps {
  usuario?: Usuario | null;
  onSubmit: (usuario: Partial<Usuario>) => void;
  onCancel: () => void;
}

// Extendemos el tipo Partial<Usuario> para incluir el password que es necesario en el formulario
type UsuarioFormData = Partial<Usuario> & { password?: string };

export default function UsuarioForm({ usuario, onSubmit, onCancel }: UsuarioFormProps) {
  const [formData, setFormData] = useState<UsuarioFormData>({
    nombre: '',
    email: '',
    telefono: '',
    rol: 'vendedor',
    activo: true,
    permisos: PERMISOS_POR_ROL.vendedor,
  });

  const [mostrarPermisos, setMostrarPermisos] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || '',
        dni: usuario.dni || '',
        domicilio: usuario.domicilio || '',
        rol: usuario.rol,
        activo: usuario.activo,
        permisos: usuario.permisos,
      });
    }
  }, [usuario]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Si cambia el rol, actualizar permisos
    if (field === 'rol') {
      setFormData((prev) => ({
        ...prev,
        permisos: PERMISOS_POR_ROL[value as Usuario['rol']],
      }));
    }
  };

  const handlePermisoChange = (
    modulo: keyof PermisosUsuario,
    accion: string,
    valor: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos!,
        [modulo]: {
          ...prev.permisos![modulo],
          [accion]: valor,
        },
      },
    }));
  };

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!usuario && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!usuario && formData.password && formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validarFormulario()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.nombre || ''}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-colors ${errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-colors ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="ejemplo@correo.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Contraseña (solo si es nuevo usuario) */}
        {!usuario && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                value={(formData as any).password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-colors ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.password}
              </p>
            )}
          </div>
        )}

        {/* DNI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI
          </label>
          <input
            type="text"
            value={formData.dni || ''}
            onChange={(e) => handleChange('dni', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Ej: 12.345.678"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="tel"
              value={formData.telefono || ''}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>
        </div>

        {/* Domicilio */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domicilio
          </label>
          <input
            type="text"
            value={formData.domicilio || ''}
            onChange={(e) => handleChange('domicilio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Ej: Av. Siempreviva 123, Springfield"
          />
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={formData.rol || 'vendedor'}
              onChange={(e) => handleChange('rol', e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none ${errors.rol ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="vendedor">Vendedor</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.rol && (
            <p className="mt-1 text-sm text-red-600">{errors.rol}</p>
          )}
        </div>
      </div>

      {/* Estado activo */}
      <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id="activo"
            checked={formData.activo || false}
            onChange={(e) => handleChange('activo', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="activo" className="font-medium text-gray-900 cursor-pointer">
            Usuario activo
          </label>
          <p className="text-gray-500">
            Permitir que este usuario acceda al sistema
          </p>
        </div>
      </div>

      {/* Descripción del rol */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={formData.rol}
        className="bg-blue-50 border border-blue-100 rounded-lg p-4"
      >
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          Permisos del rol: {formData.rol === 'admin' ? 'Administrador' : formData.rol === 'gerente' ? 'Gerente' : 'Vendedor'}
        </h4>
        <p className="text-sm text-blue-800">
          {formData.rol === 'admin' && 'Acceso completo a todas las funciones del sistema, incluyendo configuración y gestión de usuarios.'}
          {formData.rol === 'gerente' && 'Puede gestionar ventas, compras, productos y clientes. Acceso a reportes pero sin permisos de configuración.'}
          {formData.rol === 'vendedor' && 'Puede realizar ventas y gestionar clientes. Acceso limitado a otras funciones.'}
        </p>
      </motion.div>

      {/* Permisos personalizados */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setMostrarPermisos(!mostrarPermisos)}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition w-full justify-between p-2 hover:bg-blue-50 rounded-lg"
        >
          <span className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Personalizar permisos (Avanzado)
          </span>
          {mostrarPermisos ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {mostrarPermisos && formData.permisos && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4 pb-2">
                {Object.entries(formData.permisos).map(([modulo, permisos]) => (
                  <div key={modulo} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors">
                    <h4 className="font-medium text-gray-900 mb-3 capitalize flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      {modulo}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(permisos).map(([accion, valor]) => (
                        <label key={accion} className="flex items-center cursor-pointer group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={valor as boolean}
                              onChange={(e) =>
                                handlePermisoChange(
                                  modulo as keyof PermisosUsuario,
                                  accion,
                                  e.target.checked
                                )
                              }
                              className="peer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-700 capitalize group-hover:text-blue-600 transition-colors">
                            {accion}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-600/20 flex items-center"
        >
          <Check className="w-4 h-4 mr-2" />
          {usuario ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </div>
    </form >
  );
}

