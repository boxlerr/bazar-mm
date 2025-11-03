import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('*, clientes(*), venta_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(ventas);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener ventas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  const body = await request.json();

  try {
    const { data, error } = await supabase
      .from('ventas')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear venta' }, { status: 500 });
  }
}
