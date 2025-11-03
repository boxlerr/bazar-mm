import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usuarios | Bazar M&M',
  description: 'Gestión de usuarios y roles',
};

export default function UsuariosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Usuarios</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Módulo de administración de usuarios y permisos</p>
      </div>
    </div>
  );
}
