'use server'

import { createClient } from '@/lib/supabase/server'
import { calculatePoints } from '@/utils/scoring'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// ──── REGISTRO ────

export async function registerUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string
    const nickname = formData.get('nickname') as string
    const phone = formData.get('phone') as string

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

    // Insertar perfil en la tabla profiles
    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            display_name: displayName,
            nickname: nickname,
            phone: phone || null,
        })

        if (profileError) {
            console.error('Error creating profile:', profileError)
            return { error: 'Cuenta creada pero hubo un error al crear el perfil. Contacta al administrador.' }
        }
    }

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
}

// ──── ADMIN: CARGAR RESULTADO FINAL Y CALCULAR PUNTOS ────

export async function updateMatchResult(formData: FormData) {
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
                match.is_playoff
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

    redirect('/admin')
}

// ──── ADMIN: ELIMINAR USUARIO ────

export async function deleteUser(userId: string) {
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
    
    // 1. Eliminar pronósticos del usuario primero para evitar errores de llave foránea
    const { error: predError } = await supabase.from('predictions').delete().eq('user_id', userId)
    if (predError) {
        console.error('DEBUG - Error deleting user predictions:', {
            message: predError.message,
            code: predError.code,
            details: predError.details,
            hint: predError.hint,
            userId
        })
        return { error: `Error DB (Pronósticos): ${predError.message}` }
    }

    // 2. Eliminar el perfil
    const { error } = await supabase.from('profiles').delete().eq('id', userId)

    if (error) {
        console.error('DEBUG - Error deleting user profile:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            userId
        })
        return { error: `Error DB (Perfil): ${error.message}` }
    }

    return { success: true }
}

// ──── ADMIN: GESTIÓN DE EQUIPOS ────

export async function createTeam(formData: FormData) {
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
    const flagUrl = formData.get('flagUrl') as string
    const groupName = formData.get('groupName') as string

    if (!name || !groupName) {
        return { error: 'Nombre y Grupo son obligatorios.' }
    }

    const { error } = await supabase.from('teams').insert({
        name,
        flag_url: flagUrl,
        group_name: groupName.toUpperCase()
    })

    if (error) {
        console.error('Error creating team:', error)
        return { error: 'Error al crear el equipo.' }
    }

    return { success: true }
}

export async function updateTeam(formData: FormData) {
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

    const teamId = formData.get('teamId') as string
    const name = formData.get('name') as string
    const flagUrl = formData.get('flagUrl') as string
    const groupName = formData.get('groupName') as string

    if (!teamId || !name || !groupName) {
        return { error: 'ID, Nombre y Grupo son obligatorios.' }
    }

    const { error } = await supabase.from('teams').update({
        name,
        flag_url: flagUrl,
        group_name: groupName.toUpperCase()
    }).eq('id', parseInt(teamId))

    if (error) {
        console.error('Error updating team:', error)
        return { error: 'Error al actualizar el equipo.' }
    }

    return { success: true }
}

export async function deleteMatch(matchId: number) {
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

    return { success: true }
}

// ──── AUTENTICACIÓN: RECUPERACIÓN DE CONTRASEÑA ────

export async function requestPasswordReset(identifier: string) {
    const supabase = await createClient()
    let email = identifier

    // Si no parece un correo, intentamos buscarlo por nickname
    if (!identifier.includes('@')) {
        const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_nickname', {
            p_nickname: identifier
        })

        if (rpcError || !emailData) {
            return { error: 'No se encontró una cuenta con ese apodo o correo.' }
        }
        email = emailData as string
    }

    // Obtener la URL base para el redireccionamiento de forma robusta
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get('origin') || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    })

    if (error) {
        console.error('Error requesting password reset:', error)
        return { error: 'Error al enviar el correo de recuperación. Inténtalo de nuevo.' }
    }

    return { success: true }
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
