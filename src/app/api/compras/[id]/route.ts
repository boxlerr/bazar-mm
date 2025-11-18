import { createActionClient } from '@/lib/supabase/action';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { total } = body;

    const supabase = await createActionClient();

    const { error } = await supabase
      .from('compras')
      .update({ total })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error actualizando compra:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
