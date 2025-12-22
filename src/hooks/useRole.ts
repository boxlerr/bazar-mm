'use client';

import { createClient } from '@/lib/supabase/client';
import { Usuario, PERMISOS_POR_ROL } from '@/types/usuario';
import { useEffect, useState } from 'react';

export function useRole() {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const { data: dbUser } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (dbUser) {
                    setUser(dbUser as Usuario);
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const role = user?.rol || 'vendedor'; // Default to lowest privilege if not found
    const permissions = user?.permisos || PERMISOS_POR_ROL[role];

    return {
        user,
        role,
        permissions,
        loading,
        isAdmin: role === 'admin',
        isGerente: role === 'gerente',
        isVendedor: role === 'vendedor',
    };
}
