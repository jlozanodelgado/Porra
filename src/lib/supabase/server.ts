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
