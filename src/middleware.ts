import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // IMPORTANTE: Refrescar la sesión y capturar el error
    const { data: { user }, error } = await supabase.auth.getUser()

    // 🚨 EL ÚNICO CAMBIO NUEVO: Si hay error (cookie zombie de Chrome), la destruimos
    if (error) {
        await supabase.auth.signOut()
    }

    const path = request.nextUrl.pathname;

    // Rutas públicas base
    const publicRoutes = ['/login', '/register', '/auth', '/forgot-password', '/reset-password'];
    const isPublicRootRoute = publicRoutes.some(route => path.startsWith(route));

    // Rutas públicas de porra dinámica
    const segments = path.split('/').filter(Boolean);
    const isPublicPorraRoute = path.startsWith('/porra/') && (
        segments.length === 2 ||
        (segments.length === 3 && (segments[2] === 'login' || segments[2] === 'register'))
    );

    const isPublicRoute = isPublicRootRoute || isPublicPorraRoute;
    const isRoot = path === '/';
    const isPendingPage = path === '/pending-approval';

    // 1. Si no hay sesión y no es ruta pública, al login
    if (!user && !isPublicRoute && !isRoot && !isPendingPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Si hay sesión, verificar estado
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_paid, is_admin')
            .eq('id', user.id)
            .single()

        const isApproved = profile?.is_paid || profile?.is_admin || false;

        // Redirigir a pendiente si no está aprobado
        if (!isApproved && !isPublicRoute && !isRoot && !isPendingPage) {
            return NextResponse.redirect(new URL('/pending-approval', request.url))
        }

        // Redirigir al dashboard si ya está aprobado y está en /pending-approval
        if (isApproved && isPendingPage) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Evitar login/register si ya está autenticado y aprobado
        const isLoginOrRegister = path === '/login' || path === '/register' || (isPublicPorraRoute && (path.endsWith('/login') || path.endsWith('/register')));
        if (isApproved && isLoginOrRegister) {
            if (isPublicPorraRoute && segments.length >= 2) {
                const slug = segments[1];
                return NextResponse.redirect(new URL(`/porra/${slug}/dashboard`, request.url))
            }
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api (rutas de API)
         * - auth/callback (EXCLUIDO PARA FIX DE PKCE)
         * - _next/static (archivos estáticos)
         * - _next/image (optimización de imágenes)
         * - favicon.ico (favicon)
         * - Archivos con extensiones de imagen
         */
        '/((?!api|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
