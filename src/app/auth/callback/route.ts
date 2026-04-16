import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`)
    } else {
      console.error('Auth Callback Error:', error.message)
    }

  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${siteUrl}/login?error=No se pudo validar la sesión`)
}
