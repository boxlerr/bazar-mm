import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '@/services/pdfService';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('pdf') as File;
        const extractTextOnly = formData.get('extractTextOnly') === 'true';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No se proporcionó ningún archivo PDF' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        if (extractTextOnly) {
            const text = await PDFService.extractText(buffer);
            return NextResponse.json({ success: true, text });
        }

        // Default behavior (full parse) - though not used by editor here
        // const data = await PDFService.parsePDF(buffer, file.name);
        return NextResponse.json({ success: false, error: 'Invalid usage' }, { status: 400 });

    } catch (error: any) {
        console.error('Error processing PDF test:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
