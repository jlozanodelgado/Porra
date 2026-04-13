import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname');

    if (!nickname) {
        return NextResponse.json({ error: 'Falta el parámetro nickname (ej: /api/make-admin?nickname=juancito)' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();

    const { data: profile, error: searchError } = await supabaseAdmin
        .from('profiles')
        .select('id, nickname, is_admin')
        .eq('nickname', nickname)
        .single();

    if (searchError || !profile) {
        return NextResponse.json({ error: 'No se encontró el usuario con ese apodo' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: true, is_paid: true })
        .eq('id', profile.id);

    if (updateError) {
        return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: `El usuario '${nickname}' ahora es ADMINISTRADOR.`,
        instrucciones: 'Vuelve a iniciar sesión para que los cambios surtan efecto.'
    });
}
