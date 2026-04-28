import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/reset-password'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  // --- BLOQUE DE DIAGNÓSTICO ---
  const allCookies = request.headers.get('cookie') || 'NINGUNA'
  console.log('🚀 --- INICIO DE CALLBACK DEBUG ---')
  console.log('🔗 URL de origen:', origin)
  console.log('🔑 Código presente:', code ? 'SÍ' : 'NO')
  console.log('🍪 Cookies recibidas:', allCookies.substring(0, 100) + '...') 
  // -----------------------------

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('✅ Sesión validada con éxito')
      const redirectUrl = new URL(next, siteUrl)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('❌ Error de Supabase Auth:', error.message)
      // Si el error es PKCE, aquí lo confirmaremos en el log
    }
  }

  const errorUrl = new URL('/login?error=No se pudo validar la sesión', siteUrl)
  return NextResponse.redirect(errorUrl)
}
