import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre');

    if (error) throw error;

    return NextResponse.json(clientes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  const body = await request.json();

  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
  }
}
