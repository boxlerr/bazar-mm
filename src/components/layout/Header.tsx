'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Header({ user }: { user: any }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Bienvenido, {user?.user_metadata?.full_name || user?.email}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
