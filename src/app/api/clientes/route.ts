import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route';

export async function GET() {
  const supabase = await createClient();
  
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
  const supabase = await createClient();
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
