import { createClient } from '@/lib/supabase/server';

/**
 * Cliente de Supabase para Server Actions
 * Reutilizamos el cliente de servidor que ya maneja cookies correctamente con @supabase/ssr
 */
export const createActionClient = createClient;

