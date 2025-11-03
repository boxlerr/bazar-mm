import { Metadata } from 'next';
import RegisterForm from './form';

export const metadata: Metadata = {
  title: 'Registrarse | Bazar M&M',
  description: 'Crea tu cuenta en el sistema ERP de Bazar M&M',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-600 mt-2">Regístrate en Bazar M&M</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
