import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('pdf_parsing_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);

    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Error al obtener plantillas' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { data, error } = await supabase
            .from('pdf_parsing_templates')
            .insert(body)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: 'Error al crear plantilla' },
            { status: 500 }
        );
    }
}
