import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Cliente de Supabase para Server Actions
 * Usa createRouteHandlerClient que es compatible con server actions
 */
export async function createActionClient() {
  const cookieStore = await cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
}
