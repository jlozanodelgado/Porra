import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback for build time if env vars are missing
    const isInvalid = !supabaseUrl || !supabaseAnonKey || 
                     supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined' ||
                     supabaseUrl === 'null' || supabaseAnonKey === 'null';

    if (isInvalid) {
        console.warn('Supabase URL or Anon Key missing during build time. Using placeholder values.');
        return createBrowserClient<Database>(
            'https://placeholder.supabase.co',
            'placeholder-key'
        )
    }

    return createBrowserClient<Database>(
        supabaseUrl,
        supabaseAnonKey
    )
}
