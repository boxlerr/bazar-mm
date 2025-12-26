import { createAdminClient } from '@/lib/supabase/admin';
import { sendResetPassword } from '@/services/resendService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const supabase = createAdminClient();
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: {
                redirectTo: `${siteUrl}/update-password`,
            },
        });

        if (linkError) {
            console.error('Error generating link (auth.admin):', linkError);
            return NextResponse.json({ error: linkError.message }, { status: 500 });
        }

        if (linkData && linkData.properties?.action_link) {
            // Tengo el link! Enviar por Resend.
            const { success, error: emailError } = await sendResetPassword(email, linkData.properties.action_link);

            if (!success) {
                console.error('Error sending email:', emailError);
                return NextResponse.json({ error: 'Error enviando email via Resend' }, { status: 500 });
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'No se pudo generar el link de recuperación' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
