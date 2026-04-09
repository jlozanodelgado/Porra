import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback for build time if env vars are missing
    const isInvalid = !supabaseUrl || !supabaseAnonKey || 
                     supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined' ||
                     supabaseUrl === 'null' || supabaseAnonKey === 'null';

    if (isInvalid) {
        console.warn('Supabase URL or Anon Key missing during build time. Using placeholder values.');
        return createServerClient<Database>(
            'https://placeholder.supabase.co',
            'placeholder-key',
            {
                cookies: {
                    getAll() {
                        return []
                    },
                    setAll() {
                        // Do nothing
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
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )
}

/**
 * Cliente con privilegios de Service Role. 
 * ¡USAR SOLO EN SERVER ACTIONS PROTEGIDAS POR IS_ADMIN!
 * Salta políticas de RLS.
 */
export async function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
        throw new Error('Error: Falta la variable NEXT_PUBLIC_SUPABASE_URL en .env.local')
    }
    if (!supabaseServiceKey) {
        throw new Error('Error: Falta la variable SUPABASE_SERVICE_ROLE_KEY en .env.local')
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
                    // El admin client no suele manejar cookies de sesión de usuario
                },
            },
        }
    )
}
