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
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // IMPORTANTE: Refrescar la sesión
    const { data: { user } } = await supabase.auth.getUser()

    // Rutas públicas y de estado
    const publicRoutes = ['/login', '/register', '/auth', '/forgot-password', '/reset-password'];
    const path = request.nextUrl.pathname;
    const isPublicRootRoute = publicRoutes.some(route => path.startsWith(route));

    // Check for porra public routes: /porra/[slug], /porra/[slug]/login, /porra/[slug]/register
    const segments = path.split('/').filter(Boolean);
    const isPublicPorraRoute = path.startsWith('/porra/') && (
        segments.length === 2 || // /porra/[slug]
        (segments.length === 3 && (segments[2] === 'login' || segments[2] === 'register'))
    );

    const isPublicRoute = isPublicRootRoute || isPublicPorraRoute;
    const isRoot = path === '/';
    const isPendingPage = path === '/pending-approval';

    // 1. Si no hay sesión y no es ruta pública, al login
    if (!user && !isPublicRoute && !isRoot && !isPendingPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Si hay sesión, verificar estado de pago/admin
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_paid, is_admin')
            .eq('id', user.id)
            .single()

        const isApproved = profile?.is_paid || profile?.is_admin || false;

        // Si NO está aprobado y NO está en la página de pendiente/pública -> Redirigir a pendiente
        if (!isApproved && !isPublicRoute && !isRoot && !isPendingPage) {
            return NextResponse.redirect(new URL('/pending-approval', request.url))
        }

        // Si YA está aprobado y está en la página de pendiente -> Redirigir al dashboard
        if (isApproved && isPendingPage) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Si ya está logueado y aprobado, no dejar entrar a login/register
        const isLoginOrRegister = path === '/login' || path === '/register' || (isPublicPorraRoute && (path.endsWith('/login') || path.endsWith('/register')));
        if (isApproved && isLoginOrRegister) {
            // Si es una ruta de porra, redirigir al dashboard de esa porra
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
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - API routes
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
