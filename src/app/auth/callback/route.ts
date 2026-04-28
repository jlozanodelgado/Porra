import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Usamos el origin de la petición para asegurar que la redirección sea interna
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Creamos una URL segura combinando la base y el destino
      const redirectUrl = new URL(next, siteUrl)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth Callback Error:', error.message)
    }
  }

  // En caso de error, mandamos a login usando la misma lógica segura
  const errorUrl = new URL('/login?error=No se pudo validar la sesión', siteUrl)
  return NextResponse.redirect(errorUrl)
}
