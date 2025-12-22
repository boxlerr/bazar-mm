'use client';

import { Usuario } from '@/types/usuario';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  User,
  Activity,
  ShoppingBag,
  Users,
  Package
} from 'lucide-react';

interface DetalleUsuarioProps {
  usuario: Usuario;
  onClose: () => void;
}

import { useState, useEffect } from 'react';
import { obtenerEstadisticasUsuario } from './actions';

export default function DetalleUsuario({ usuario, onClose }: DetalleUsuarioProps) {
  const [estadisticas, setEstadisticas] = useState({ ventas: 0, clientes: 0, productos: 0 });
  const [diasActivo, setDiasActivo] = useState(0);

  useEffect(() => {
    // Calcular días activo
    const fechaCreacion = new Date(usuario.created_at);
    const hoy = new Date();
    const diferenciaTiempo = Math.abs(hoy.getTime() - fechaCreacion.getTime());
    const dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
    setDiasActivo(dias);

    // Cargar estadísticas del servidor
    obtenerEstadisticasUsuario(usuario.id).then(res => {
      if (res.success && res.data) {
        setEstadisticas(res.data);
      }
    });
  }, [usuario.id, usuario.created_at]);
  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'gerente':
        return 'Gerente';
      case 'vendedor':
        return 'Vendedor';
      default:
        return rol;
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header con avatar */}
      <motion.div
        variants={item}
        className="flex items-center space-x-6 pb-6 border-b border-gray-100"
      >
        <div className="relative">
          {usuario.avatar ? (
            <img
              src={usuario.avatar}
              alt={usuario.nombre}
              className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white ${usuario.activo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{usuario.nombre}</h3>
          <div className="flex items-center text-gray-500 mt-1">
            <Mail className="w-4 h-4 mr-2" />
            {usuario.email}
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span
              className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${usuario.rol === 'admin'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : usuario.rol === 'gerente'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-green-100 text-green-700 border border-green-200'
                }`}
            >
              <Shield className="w-3 h-3 mr-1" />
              {getRolLabel(usuario.rol)}
            </span>
            <span
              className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${usuario.activo
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
                }`}
            >
              {usuario.activo ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
              {usuario.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información de contacto */}
        <motion.div variants={item} className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Información Personal
          </h4>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
            <div className="flex items-start">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Email</span>
                <p className="text-gray-900 font-medium">{usuario.email}</p>
              </div>
            </div>
            {usuario.dni && (
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">DNI</span>
                  <p className="text-gray-900 font-medium">{usuario.dni}</p>
                </div>
              </div>
            )}
            {usuario.telefono && (
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Teléfono</span>
                  <p className="text-gray-900 font-medium">{usuario.telefono}</p>
                </div>
              </div>
            )}
            {usuario.domicilio && (
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Domicilio</span>
                  <p className="text-gray-900 font-medium">{usuario.domicilio}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Información del sistema */}
        <motion.div variants={item} className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Actividad del Sistema
          </h4>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
            <div className="flex items-start">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Fecha de Creación</span>
                <p className="text-gray-900 font-medium">
                  {formatearFecha(usuario.created_at)}
                </p>
              </div>
            </div>
            {usuario.ultimo_acceso && (
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Último Acceso</span>
                  <p className="text-gray-900 font-medium">
                    {formatearFecha(usuario.ultimo_acceso)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Permisos */}
      <motion.div variants={item}>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Permisos del Usuario
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {usuario.permisos ? (
            Object.entries(usuario.permisos).map(([modulo, permisos]) => (
              <div key={modulo} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <h5 className="font-medium text-gray-900 mb-3 capitalize flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  {modulo}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(permisos).map(([accion, valor]) => (
                    <span
                      key={accion}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center ${valor
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}
                    >
                      {valor ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {accion}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2 text-center py-4">No se encontraron permisos definidos.</p>
          )}
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div variants={item}>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Estadísticas de Actividad
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
            <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{estadisticas.ventas}</div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Ventas</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{estadisticas.clientes}</div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Clientes Atendidos</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
            <Package className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{estadisticas.productos}</div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Productos Vendidos</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{diasActivo}</div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Días Activo</div>
          </div>
        </div>
      </motion.div>

      {/* Botón cerrar */}
      <motion.div variants={item} className="flex justify-end pt-6 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium shadow-lg shadow-gray-900/10"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}
