'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function crearCompra(formData: FormData) {
  const supabase = await createClient();

  // Implementar lógica de creación de compra
  
  revalidatePath('/compras');
  return { success: true };
}
