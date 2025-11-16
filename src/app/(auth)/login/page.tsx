import { Metadata } from 'next';
import LoginForm from './form';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Bazar M&M',
  description: 'Accede al sistema ERP de Bazar M&M',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bazar M&M</h1>
            <p className="text-gray-900 mt-2 font-medium">Sistema de Gestión</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
