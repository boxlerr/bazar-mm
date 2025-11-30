import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar la sesión si es necesario
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas protegidas (dashboard)
  if (request.nextUrl.pathname.startsWith('/ventas') ||
    request.nextUrl.pathname.startsWith('/compras') ||
    request.nextUrl.pathname.startsWith('/stock') ||
    request.nextUrl.pathname.startsWith('/clientes') ||
    request.nextUrl.pathname.startsWith('/caja') ||
    request.nextUrl.pathname.startsWith('/reportes') ||
    request.nextUrl.pathname.startsWith('/usuarios') ||
    request.nextUrl.pathname.startsWith('/configuracion')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirigir usuarios autenticados desde login/register a dashboard
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/ventas', request.url))
  }

  // Redirigir desde raíz a ventas si está autenticado
  if (request.nextUrl.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/ventas', request.url))
  }

  // Redirigir desde raíz a login si no está autenticado
  if (request.nextUrl.pathname === '/' && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/', '/ventas/:path*', '/compras/:path*', '/stock/:path*', '/clientes/:path*', '/caja/:path*', '/reportes/:path*', '/usuarios/:path*', '/configuracion/:path*', '/login', '/register'],
}
