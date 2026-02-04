'use client';

import { Usuario } from '@/types/usuario';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TablaUsuariosProps {
  usuarios: Usuario[];
  onEditar: (usuario: Usuario) => void;
  onEliminar: (usuario: Usuario) => void;
  onVerDetalle: (usuario: Usuario) => void;
  onCambiarEstado: (id: string, activo: boolean) => void;
}

export default function TablaUsuarios({
  usuarios,
  onEditar,
  onEliminar,
  onVerDetalle,
  onCambiarEstado,
}: TablaUsuariosProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Filtrar usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const cumpleBusqueda =
        usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.email.toLowerCase().includes(busqueda.toLowerCase());

      const cumpleRol = filtroRol === 'todos' || usuario.rol === filtroRol;
      const cumpleEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activos' && usuario.activo) ||
        (filtroEstado === 'inactivos' && !usuario.activo);

      return cumpleBusqueda && cumpleRol && cumpleEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  // Calcular paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Shield className="w-4 h-4 mr-1" />;
      case 'gerente':
        return <Briefcase className="w-4 h-4 mr-1" />;
      default:
        return <UserIcon className="w-4 h-4 mr-1" />;
    }
  };

  const getRolBadgeColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'gerente':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'vendedor':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Filtro por rol */}
          <div className="md:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={filtroRol}
              onChange={(e) => {
                setFiltroRol(e.target.value);
                setPaginaActual(1);
              }}
              className="pl-9 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer"
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="gerente">Gerente</option>
              <option value="vendedor">Vendedor</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="md:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
              className="pl-9 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 appearance-none cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="flex justify-between items-center text-sm text-gray-500 px-1">
          <span>
            Mostrando <span className="font-medium text-gray-900">{usuariosPaginados.length}</span> de <span className="font-medium text-gray-900">{usuariosFiltrados.length}</span> usuarios
          </span>
          {(busqueda || filtroRol !== 'todos' || filtroEstado !== 'todos') && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium">
              Filtros activos
            </span>
          )}
        </div>
      </motion.div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Domicilio
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="wait">
                {usuariosPaginados.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <UserIcon className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">No se encontraron usuarios</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  usuariosPaginados.map((usuario, index) => (
                    <motion.tr
                      key={usuario.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            {usuario.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                src={usuario.avatar}
                                alt={usuario.nombre}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                                {usuario.nombre.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${usuario.activo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {usuario.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{usuario.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{usuario.dni || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{usuario.telefono || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{usuario.domicilio || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full border ${getRolBadgeColor(
                            usuario.rol
                          )}`}
                        >
                          {getRolIcon(usuario.rol)}
                          {getRolLabel(usuario.rol)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => onCambiarEstado(usuario.id, !usuario.activo)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${usuario.activo ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${usuario.activo ? 'translate-x-5' : 'translate-x-0'
                              }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onVerDetalle(usuario)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditar(usuario)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEliminar(usuario)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden">
          {usuariosPaginados.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 py-12 px-4 text-center">
              <UserIcon className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-lg font-medium text-gray-500">No se encontraron usuarios</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {usuariosPaginados.map((usuario) => (
                <div key={usuario.id} className="p-4 bg-white flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 relative">
                        {usuario.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover border border-gray-100"
                            src={usuario.avatar}
                            alt={usuario.nombre}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${usuario.activo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {usuario.nombre}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          {usuario.email}
                        </div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <span
                      className={`px-2 py-0.5 inline-flex items-center text-[10px] font-medium rounded-full border ${getRolBadgeColor(
                        usuario.rol
                      )}`}
                    >
                      {getRolLabel(usuario.rol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCambiarEstado(usuario.id, !usuario.activo)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${usuario.activo ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${usuario.activo ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                      </button>
                      <span className="text-xs text-gray-500">{usuario.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onVerDetalle(usuario)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditar(usuario)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEliminar(usuario)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="bg-gray-50/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Página <span className="font-medium">{paginaActual}</span> de{' '}
                  <span className="font-medium">{totalPaginas}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                    disabled={paginaActual === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <button
                      key={pagina}
                      onClick={() => setPaginaActual(pagina)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagina === paginaActual
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {pagina}
                    </button>
                  ))}
                  <button
                    onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
