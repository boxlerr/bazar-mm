'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-end items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-gray-900 hover:text-blue-600 font-medium transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
