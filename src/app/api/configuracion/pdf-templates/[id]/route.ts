import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET una plantilla específica
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('pdf_parsing_templates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            return NextResponse.json(
                { error: 'Plantilla no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching pdf template:', error);
        return NextResponse.json(
            { error: error.message || 'Error fetching pdf template' },
            { status: 500 }
        );
    }
}

// PUT para actualizar una plantilla
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        // Sanear proveedor_id para evitar el string "undefined"
        const proveedorIdLimpio = (
            body.proveedor_id === "undefined" ||
            body.proveedor_id === "" ||
            body.proveedor_id === undefined
        ) ? null : body.proveedor_id;

        // Remove id if present to avoid updating primary key
        const { id: bodyId, created_at, updated_at, ...restBody } = body;
        const updateData = {
            ...restBody,
            proveedor_id: proveedorIdLimpio
        };

        const { data, error } = await supabase
            .from('pdf_parsing_templates')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating pdf template:', error);
        return NextResponse.json(
            { error: error.message || 'Error updating pdf template' },
            { status: 500 }
        );
    }
}

// DELETE para borrar una plantilla
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { error } = await supabase
            .from('pdf_parsing_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting pdf template:', error);
        return NextResponse.json(
            { error: error.message || 'Error deleting pdf template' },
            { status: 500 }
        );
    }
}
