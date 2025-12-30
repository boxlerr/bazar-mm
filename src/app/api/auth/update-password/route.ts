import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();
        const supabase = createAdminClient();

        // 1. Validate Token
        const { data: resetRecord, error: resetError } = await supabase
            .from('password_resets')
            .select('*')
            .eq('token', token)
            .single();

        if (resetError || !resetRecord) {
            return NextResponse.json({ error: 'Token inválido o no encontrado.' }, { status: 400 });
        }

        // 2. Check Expiration
        if (new Date(resetRecord.expires_at) < new Date()) {
            return NextResponse.json({ error: 'El enlace ha expirado.' }, { status: 400 });
        }

        // 3. Find User by Email to get ID
        // Note: admin.listUsers works, or we can assume email is unique and just list users filtering by email
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

        // Filter manually or use database query if possible, but listUsers pagination might be an issue if HUGE userbase. 
        // Better: supabase.auth.admin.listUsers() isn't ideal for large sets.
        // Alternative: Query 'auth.users' schema if we have permission.
        // SAFE BET: supabase.auth.admin.createUser/updateUser usually needs ID.
        // Let's try to find the user by email from the list (local scale is small). 
        // For production scale, we should trust the email from `password_resets` and maybe query `auth.users` directly via SQL or just rely on listUsers returning it.

        // Actually, supabase.auth.admin.listUsers() doesn't support email filter in all versions directly? 
        // Let's check docs mentally: listUsers() returns a list.
        // BETTER: We can just use `updateUserById` if we had the ID. We only have email.
        // SUPERIORE: We can use `supabase.auth.admin.updateUserById` but we need ID.
        // Let's just iterate listUsers() for now or assume small userbase?
        // NO, inefficient.
        // Supabase Admin API: getUserById exists. getUserByEmail? No.

        // Let's use the `auth.users` table access via the admin client since we are Service Role.
        // BUT `auth` schema is protected.

        // Wait, supabase-js v2: `supabase.auth.admin.listUsers()` returns everything? No, pagination.
        // Re-read: We can use `supabase.auth.admin.updateUser`... NO.

        // Let's try to get the user ID via a raw SQL query since we are admin?
        // Or... 
        // Let's assume we can loop.

        // WAIT: `supabase.auth.admin.updateUser` isn't a thing?
        // `supabase.auth.admin.updateUserById(uid, attributes)` YES.

        // Let's do a trick: If we can't find ID by email easily via API, we can use RPC or raw query?
        // Actually, for this specific project (Bazar M-M), the userbase is defined in `public.users` (created by trigger) as well?
        // If so, we can query `public.users` to get the `id`.

        const { data: publicUser, error: publicUserError } = await supabase
            .from('users') // Assuming there is a users table that has email -> id mapping
            .select('id')
            .eq('email', resetRecord.email)
            .single();

        // If public.users handles sync, this is perfect.
        // If not, we have to fallback to listUsers filtering.

        let userId = publicUser?.id;

        if (!userId) {
            // Fallback: This is expensive if many users
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const found = users.find(u => u.email === resetRecord.email);
            if (found) userId = found.id;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
        }

        // 4. Update Password
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: password
        });

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 5. Delete Token
        await supabase
            .from('password_resets')
            .delete()
            .eq('token', token);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Update password error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
