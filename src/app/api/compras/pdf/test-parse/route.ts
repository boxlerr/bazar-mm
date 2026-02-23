import { NextResponse } from 'next/server';
import { PDFService } from '@/services/pdfService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text, template } = body;

        // Use a method in PDFService that accepts text + template
        // We need to expose this method or make it public
        // Since extractDynamicData is private, we can make it public or add a wrapper.
        // For now, let's create a static wrapper in PDFService or just change access modifier.
        // I will add 'testDynamicParse' to PDFService.

        // @ts-ignore - Assuming we will add this method
        const result = PDFService.testDynamicParse(text, template);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error testing parse:', error);
        return NextResponse.json(
            { error: `Error detallado: ${error?.message || String(error)}` },
            { status: 500 }
        );
    }
}
