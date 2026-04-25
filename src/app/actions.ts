'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { calculatePoints } from '@/utils/scoring'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ──── REGISTRO ────

export async function registerUser(formData: FormData) {
    try {
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const displayName = formData.get('displayName') as string
        const nickname = formData.get('nickname') as string
        const phone = formData.get('phone') as string
        const avatarUrl = formData.get('avatarUrl') as string
        const porraId = formData.get('porraId') as string

        if (!email || !password || !displayName || !nickname) {
            return { error: 'Todos los campos obligatorios deben ser completados.' }
        }

        const supabase = await createClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: displayName }
            }
        })

        if (error) {
            return { error: error.message }
        }

        // Insertar perfil usando el admin client para saltar RLS.
        // Necesario en Supabase self-hosted donde signUp() puede no crear
        // una sesión inmediata si la confirmación de email está activa,
        // haciendo que auth.uid() sea null y bloqueando la política INSERT.
        if (data.user) {
            const adminSupabase = await createAdminClient()
            const { error: profileError } = await adminSupabase.from('profiles').insert({
                id: data.user.id,
                display_name: displayName,
                nickname: nickname,
                phone: phone || null,
                avatar_url: avatarUrl || null,
                porra_id: porraId || null,
            })

            if (profileError) {
                console.error('Error creating profile (DB error):', profileError)
                return { error: 'Cuenta creada pero hubo un error al crear el perfil. Contacta al administrador.' }
            }
        }

        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in registerUser:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

// ──── ADMIN: GESTIÓN DE PORRAS ────

export async function createPorra(formData: FormData) {
    try {
        const supabase = await createClient()

        // Verificar admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        const name = formData.get('name') as string
        const slug = formData.get('slug') as string
        const logoUrl = formData.get('logoUrl') as string
        const primaryColor = formData.get('primaryColor') as string
        const secondaryColor = formData.get('secondaryColor') as string
        const prizeConfigRaw = formData.get('prizeConfig') as string
        const prizeConfig = prizeConfigRaw ? JSON.parse(prizeConfigRaw) : []

        if (!name || !slug) {
            return { error: 'Nombre y slug son obligatorios.' }
        }

        const { error } = await supabase.from('porras').insert({
            name,
            slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            logo_url: logoUrl || null,
            primary_color: primaryColor || '#00ff00',
            secondary_color: secondaryColor || '#00ffff',
            prize_config: prizeConfig
        })

        if (error) {
            console.error('Database error in createPorra:', error)
            return { error: 'Error al crear la porra. El slug puede ya existir.' }
        }

        revalidatePath('/admin/porras')
        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in createPorra:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

export async function updatePorra(formData: FormData) {
    try {
        const supabase = await createClient()

        // Verificar admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        const porraId = formData.get('porraId') as string
        const name = formData.get('name') as string
        const slug = formData.get('slug') as string
        const logoUrl = formData.get('logoUrl') as string
        const primaryColor = formData.get('primaryColor') as string
        const secondaryColor = formData.get('secondaryColor') as string
        const prizeConfigRaw = formData.get('prizeConfig') as string
        const prizeConfig = prizeConfigRaw ? JSON.parse(prizeConfigRaw) : []

        if (!porraId || !name || !slug) {
            return { error: 'ID, nombre y slug son obligatorios.' }
        }

        const { error } = await supabase.from('porras').update({
            name,
            slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            logo_url: logoUrl || null,
            primary_color: primaryColor || '#00ff00',
            secondary_color: secondaryColor || '#00ffff',
            prize_config: prizeConfig
        }).eq('id', porraId)

        if (error) {
            console.error('Error updating porra:', error)
            return { error: 'Error al actualizar la porra.' }
        }

        revalidatePath('/admin/porras')
        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in updatePorra:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

export async function deletePorra(porraId: string) {
    const supabase = await createClient()

    // Verificar admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado.' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

    // Verificar que no haya usuarios asociados
    const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('porra_id', porraId)
        .limit(1)

    if (users && users.length > 0) {
        return { error: 'No se puede eliminar la porra porque tiene usuarios asociados. Elimina o reasigna los usuarios primero.' }
    }

    const { error } = await supabase.from('porras').delete().eq('id', porraId)

    if (error) {
        console.error('Error deleting porra:', error)
        return { error: 'Error al eliminar la porra.' }
    }

    revalidatePath('/admin/porras')
    return { success: true }
}

// ──── ADMIN: GESTIÓN DE USUARIOS ────

export async function toggleUserPaid(userId: string, isPaid: boolean) {
    const supabase = await createClient()

    // Verificar que el usuario actual es admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado.' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

    const { error } = await supabase.from('profiles').update({ is_paid: isPaid }).eq('id', userId)

    if (error) {
        console.error('Error toggling user paid:', error)
        return { error: 'Error al actualizar el estado de pago.' }
    }

    return { success: true }
}

// ──── ADMIN: CREAR / EDITAR PARTIDOS ────

export async function upsertMatch(formData: FormData) {
    try {
        const supabase = await createClient()

        // Verificar admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        const matchId = formData.get('matchId') as string | null
        const homeTeamId = parseInt(formData.get('homeTeamId') as string)
        const awayTeamId = parseInt(formData.get('awayTeamId') as string)
        const kickoffTime = formData.get('kickoffTime') as string
        const isPlayoff = formData.get('isPlayoff') === 'true'

        if (!homeTeamId || !awayTeamId || !kickoffTime) {
            return { error: 'Faltan datos del partido.' }
        }

        if (matchId) {
            // Editar partido existente
            const { error } = await supabase.from('matches').update({
                home_team_id: homeTeamId,
                away_team_id: awayTeamId,
                kickoff_time: kickoffTime,
                is_playoff: isPlayoff,
            }).eq('id', parseInt(matchId))

            if (error) {
                console.error('Error updating match:', error)
                return { error: 'Error al actualizar el partido.' }
            }
        } else {
            // Crear partido nuevo
            const { error } = await supabase.from('matches').insert({
                home_team_id: homeTeamId,
                away_team_id: awayTeamId,
                kickoff_time: kickoffTime,
                is_playoff: isPlayoff,
            })

            if (error) {
                console.error('Error creating match:', error)
                return { error: 'Error al crear el partido.' }
            }
        }

        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in upsertMatch:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

// ──── ADMIN: CARGAR RESULTADO FINAL Y CALCULAR PUNTOS ────

export async function updateMatchResult(formData: FormData) {
    try {
        const supabase = await createClient()

        // Verificar admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        const matchId = parseInt(formData.get('matchId') as string)
        const homeGoalsReal = parseInt(formData.get('homeGoalsReal') as string)
        const awayGoalsReal = parseInt(formData.get('awayGoalsReal') as string)

        if (isNaN(matchId) || isNaN(homeGoalsReal) || isNaN(awayGoalsReal)) {
            return { error: 'Datos inválidos.' }
        }

        // 1. Obtener datos del partido para saber si es playoff
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('is_playoff')
            .eq('id', matchId)
            .single()

        if (matchError || !match) return { error: 'Partido no encontrado.' }

        // 2. Actualizar resultado del partido
        const { error: updateError } = await supabase.from('matches').update({
            home_goals_real: homeGoalsReal,
            away_goals_real: awayGoalsReal,
            status: 'finished',
        }).eq('id', matchId)

        if (updateError) {
            console.error('Error updating match result:', updateError)
            return { error: 'Error al guardar el resultado.' }
        }

        // 3. Obtener todas las predicciones de este partido
        const { data: predictions, error: predError } = await supabase
            .from('predictions')
            .select('id, home_goals_pred, away_goals_pred')
            .eq('match_id', matchId)

        if (predError) {
            console.error('Error fetching predictions:', predError)
            return { error: 'Resultado guardado, pero error al calcular puntos.' }
        }

        // 4. Calcular puntos para cada predicción y actualizar
        if (predictions && predictions.length > 0) {
            for (const pred of predictions) {
                const points = calculatePoints(
                    pred.home_goals_pred,
                    pred.away_goals_pred,
                    homeGoalsReal,
                    awayGoalsReal,
                    match.is_playoff ?? false
                )

                await supabase.from('predictions').update({
                    points_earned: points
                }).eq('id', pred.id)
            }

            // 5. Recalcular total_points de todos los usuarios que tenían predicción
            const userIds = [...new Set(
                (await supabase.from('predictions').select('user_id').eq('match_id', matchId))
                    .data?.map(p => p.user_id) ?? []
            )]

            for (const uid of userIds) {
                const { data: userPreds } = await supabase
                    .from('predictions')
                    .select('points_earned')
                    .eq('user_id', uid)

                const total = userPreds?.reduce((sum, p) => sum + (p.points_earned || 0), 0) ?? 0

                await supabase.from('profiles').update({
                    total_points: total
                }).eq('id', uid)
            }
        }

        revalidatePath('/admin')
        revalidatePath('/dashboard')
        redirect('/admin')
    } catch (err: any) {
        if (err.digest?.includes('NEXT_REDIRECT')) throw err; // Permitir que redirect funcione
        console.error('CRITICAL - Unhandled error in updateMatchResult:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

// ──── ADMIN: ELIMINAR USUARIO ────

export async function deleteUser(userId: string) {
    try {
        // 1. Verificar que el usuario que llama ES ADMIN (con cliente normal)
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        // 2. Usar cliente administrativo para saltar RLS y borrar todo
        // Intentamos crear el cliente admin. Si fallan las env vars, lanzará error.
        let adminSupabase;
        try {
            adminSupabase = await createAdminClient()
        } catch (adminError: any) {
            console.error('Error creating admin client:', adminError)
            return { error: 'Error de configuración del servidor (Service Role Key). Verifica las variables de entorno.' }
        }

        // A. Eliminar pronósticos
        const { error: predError } = await adminSupabase.from('predictions').delete().eq('user_id', userId)
        if (predError) {
            console.error('DEBUG - Error deleting user predictions:', predError)
            return { error: `Error DB (Pronósticos): ${predError.message}` }
        }

        // B. Eliminar el perfil
        const { error: profileError } = await adminSupabase.from('profiles').delete().eq('id', userId)
        if (profileError) {
            console.error('DEBUG - Error deleting user profile:', profileError)
            return { error: `Error DB (Perfil): ${profileError.message}` }
        }

        // C. Eliminar de Supabase Auth (Raíz)
        const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
        if (authError) {
            console.error('DEBUG - Error deleting auth user:', authError)
            // No bloqueamos el éxito si el perfil ya se borró, pero avisamos.
            // A veces el usuario no existe en auth pero sí en profiles por errores previos.
        }

        revalidatePath('/admin')
        revalidatePath('/admin/users')
        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in deleteUser:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

// ──── ADMIN: GESTIÓN DE EQUIPOS ────

export async function createTeam(formData: FormData) {
    try {
        // Verificar admin con cliente normal
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        // Usar cliente administrativo para la operación
        let adminSupabase;
        try {
            adminSupabase = await createAdminClient()
        } catch (adminError) {
            return { error: 'Error de configuración del servidor (Admin Client). Verifica las variables de entorno.' }
        }

        const name = formData.get('name') as string
        const flagUrl = formData.get('flagUrl') as string
        const groupName = formData.get('groupName') as string

        if (!name || !groupName) {
            return { error: 'Nombre y Grupo son obligatorios.' }
        }

        const { error } = await adminSupabase.from('teams').insert({
            name,
            flag_url: flagUrl,
            group_name: groupName.toUpperCase()
        })

        if (error) {
            console.error('Error creating team:', error)
            return { error: 'Error al crear el equipo.' }
        }

        revalidatePath('/admin/teams')
        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in createTeam:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

export async function updateTeam(formData: FormData) {
    try {
        // Verificar admin con cliente normal
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        // Usar cliente administrativo para la operación
        let adminSupabase;
        try {
            adminSupabase = await createAdminClient()
        } catch (adminError) {
            return { error: 'Error de configuración del servidor (Admin Client). Verifica las variables de entorno.' }
        }

        const teamId = formData.get('teamId') as string
        const name = formData.get('name') as string
        const flagUrl = formData.get('flagUrl') as string
        const groupName = formData.get('groupName') as string

        if (!teamId || !name || !groupName) {
            return { error: 'ID, Nombre y Grupo son obligatorios.' }
        }

        const { error } = await adminSupabase.from('teams').update({
            name,
            flag_url: flagUrl,
            group_name: groupName.toUpperCase()
        }).eq('id', parseInt(teamId))

        if (error) {
            console.error('Error updating team:', error)
            return { error: 'Error al actualizar el equipo.' }
        }

        revalidatePath('/admin/teams')
        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in updateTeam:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

export async function deleteTeam(teamId: number) {
    try {
        const supabase = await createClient()

        // Verificar admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        // Usar cliente administrativo para saltar RLS
        let adminSupabase;
        try {
            adminSupabase = await createAdminClient()
        } catch (adminError) {
            return { error: 'Error de configuración del servidor (Admin Client). Verifica las variables de entorno.' }
        }

        // Intentar eliminar el equipo
        // NOTA: Si el equipo tiene partidos asociados, esto fallará por FK constraints (comportamiento deseado)
        const { error } = await adminSupabase.from('teams').delete().eq('id', teamId)

        if (error) {
            console.error('Error deleting team:', error)
            if (error.code === '23503') {
                return { error: 'No se puede eliminar el equipo porque tiene partidos asociados. Elimina primero los partidos.' }
            }
            return { error: 'Error al eliminar el equipo.' }
        }

        revalidatePath('/admin/teams')
        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in deleteTeam:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

export async function bulkUpsertMatches(matchesData: any[]) {
    try {
        const supabase = await createClient()

        // Verificar admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        // Preparar datos (convertir ids a número y asegurar UTC)
        const formattedMatches = matchesData.map(m => ({
            home_team_id: parseInt(m.homeTeamId),
            away_team_id: parseInt(m.awayTeamId),
            kickoff_time: m.kickoffTime,
            is_playoff: m.isPlayoff === true || m.isPlayoff === 'true',
            status: 'pending'
        }));

        // Insertar masivamente
        const { error } = await supabase.from('matches').insert(formattedMatches)

        if (error) {
            console.error('Error bulk creating matches:', error)
            return { error: 'Error al realizar la carga masiva de partidos.' }
        }

        revalidatePath('/admin/matches')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in bulkUpsertMatches:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

export async function deleteMatch(matchId: number) {
    try {
        const supabase = await createClient()

        // Verificar admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No autenticado.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) return { error: 'No tienes permisos de administrador.' }

        // 1. Obtener los IDs de los usuarios que tienen predicciones en este partido
        const { data: predictions } = await supabase
            .from('predictions')
            .select('user_id')
            .eq('match_id', matchId)
        
        const affectedUserIds = [...new Set(predictions?.map(p => p.user_id) || [])]

        // 2. Eliminar predicciones asociadas primero (ya que no hay ON DELETE CASCADE en la BD)
        const { error: predDeleteError } = await supabase.from('predictions').delete().eq('match_id', matchId)
        
        if (predDeleteError) {
            console.error('Error deleting predictions:', predDeleteError)
            return { error: 'Error al eliminar los pronósticos asociados.' }
        }

        // 3. Eliminar el partido
        const { error: deleteError } = await supabase.from('matches').delete().eq('id', matchId)

        if (deleteError) {
            console.error('Error deleting match:', deleteError)
            return { error: 'Error al eliminar el partido.' }
        }

        // 4. Recalcular total_points para cada usuario afectado
        for (const userId of affectedUserIds) {
            const { data: userPreds } = await supabase
                .from('predictions')
                .select('points_earned')
                .eq('user_id', userId)

            const newTotal = userPreds?.reduce((sum, p) => sum + (p.points_earned || 0), 0) ?? 0

            await supabase.from('profiles').update({
                total_points: newTotal
            }).eq('id', userId)
        }

        revalidatePath('/admin/matches')
        return { success: true }
    } catch (err: any) {
        console.error('CRITICAL - Unhandled error in deleteMatch:', err)
        return { error: `Error inesperado: ${err.message || 'Error del servidor'}` }
    }
}

// ──── AUTENTICACIÓN: RECUPERACIÓN DE CONTRASEÑA ────

export async function requestPasswordReset(identifier: string) {
    const supabase = await createClient()
    const cleanIdentifier = identifier.trim()
    let email = cleanIdentifier

    // Si no parece un correo, intentamos buscarlo por nickname
    if (!cleanIdentifier.includes('@')) {
        const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_nickname', {
            p_nickname: cleanIdentifier
        })

        if (rpcError || !emailData) {
            console.error('RPC Error searching email:', rpcError)
            return { error: 'No se encontró una cuenta con ese apodo o correo.' }
        }
        email = emailData as string
    }

    // Obtener la URL base para el redireccionamiento de forma robusta
    const { headers: getHeaders } = await import('next/headers')
    const headersList = await getHeaders()
    const host = headersList.get('host')
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
    
    // Asegurar que no termine en / para evitar dobles barras
    if (siteUrl.endsWith('/')) {
        siteUrl = siteUrl.slice(0, -1)
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    })

    if (error) {
        console.error('Supabase Reset Password Error:', error)
        return { error: `Error de Supabase: ${error.message}` }
    }

    // Enmascarar el email para seguridad antes de enviarlo al cliente
    const maskedEmail = (emailStr: string) => {
        const [local, domain] = emailStr.split('@');
        if (!local || !domain) return emailStr;
        const maskSide = (str: string) => {
            if (str.length <= 2) return str[0] + '*';
            return str[0] + '*'.repeat(Math.min(str.length - 2, 5)) + str[str.length - 1];
        };
        const domainParts = domain.split('.');
        const domainName = domainParts[0];
        const tld = domainParts.slice(1).join('.');
        return `${maskSide(local)}@${maskSide(domainName)}.${tld}`;
    };

    return { success: true, email: maskedEmail(email) }
}




export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password.length < 6) {
        return { error: 'La contraseña debe tener al menos 6 caracteres.' }
    }

    if (password !== confirmPassword) {
        return { error: 'Las contraseñas no coinciden.' }
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Error updating password:', error)
        return { error: 'No se pudo actualizar la contraseña. El enlace puede haber expirado.' }
    }

    return { success: true }
}
