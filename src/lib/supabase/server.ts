import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback para tiempo de compilación si faltan variables de entorno
    const isInvalid = !supabaseUrl || !supabaseAnonKey || 
                     supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined' ||
                     supabaseUrl === 'null' || supabaseAnonKey === 'null';

    if (isInvalid) {
        console.warn('Supabase URL o Anon Key ausentes. Usando valores temporales.');
        return createServerClient<Database>(
            'https://placeholder.supabase.co',
            'placeholder-key',
            {
                cookies: {
                    getAll() {
                        return []
                    },
                    setAll() {
                        // No hacer nada
                    },
                },
            }
        )
    }

    return createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                // CONFIGURACIÓN CRÍTICA PARA FIX DE PKCE
                                path: '/',
                                sameSite: 'lax',
                                secure: true,
                            })
                        )
                    } catch {
                        // El método setAll fue llamado desde un Server Component
                    }
                },
            },
        }
    )
}

/**
 * Cliente con privilegios de Service Role. 
 * ¡USAR SOLO EN SERVER ACTIONS PROTEGIDAS POR IS_ADMIN!
 */
export async function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Faltan variables de configuración para el cliente Admin')
    }

    return createServerClient<Database>(
        supabaseUrl,
        supabaseServiceKey,
        {
            cookies: {
                getAll() {
                    return []
                },
                setAll() {
                    // El admin client no suele manejar cookies de usuario
                },
            },
        }
    )
}
