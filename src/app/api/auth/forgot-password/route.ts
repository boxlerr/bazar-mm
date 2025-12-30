import { createAdminClient } from '@/lib/supabase/admin';
import { sendResetPassword } from '@/services/resendService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
            return NextResponse.json({ error: 'Configuración de servidor incompleta (Service Key missing).' }, { status: 500 });
        }

        const supabase = createAdminClient();
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // 1. Generate custom token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        // 2. Store in DB
        const { error: dbError } = await supabase
            .from('password_resets')
            .insert({
                email,
                token,
                expires_at: expiresAt.toISOString(),
            });

        if (dbError) {
            console.error('Error storing reset token:', dbError);
            return NextResponse.json({ error: `Error DB: ${dbError.message}` }, { status: 500 });
        }

        // 3. Construct Link
        const resetLink = `${siteUrl}/update-password?token=${token}`;

        // 4. Send Email via Resend
        // Note: modify sendResetPassword to accept the link directly if it expects something specific, 
        // or just pass this link.
        const { success, error: emailError } = await sendResetPassword(email, resetLink);

        if (!success) {
            console.error('Error sending email:', emailError);
            return NextResponse.json({ error: 'Error enviando email via Resend' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
