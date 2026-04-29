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
      // Si todo sale bien, redirigimos a la página deseada (p.ej. /reset-password)
      return NextResponse.redirect(new URL(next, siteUrl))
    } else {
      console.error('❌ Error de Supabase Auth en exchangeCodeForSession:', error.message)
      // Si el error es sobre el flujo de PKCE, intentamos redirigir de todos modos si ya existe sesión
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('ℹ️ Sesión ya existente, redirigiendo a:', next)
        return NextResponse.redirect(new URL(next, siteUrl))
      }
      
      const errorMsg = encodeURIComponent(`Error de autenticación: ${error.message}`)
      return NextResponse.redirect(new URL(`/login?error=${errorMsg}`, siteUrl))
    }
  }

  // Si no hay código, podría ser un flujo de recuperación antiguo (en el hash)
  // o simplemente un acceso inválido
  console.error('❌ No se encontró el código de validación en la URL')
  const errorUrl = new URL('/login?error=No se pudo validar la sesión (Código ausente)', siteUrl)
  return NextResponse.redirect(errorUrl)
}
