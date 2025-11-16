import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('proveedores')
      .select('id, nombre, razon_social')
      .eq('activo', true)
      .order('nombre');
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data || []);
    
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    return NextResponse.json(
      { error: 'Error al obtener proveedores' },
      { status: 500 }
    );
  }
}
