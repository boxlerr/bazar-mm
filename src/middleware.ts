import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refrescar la sesión si es necesario
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Intentar refrescar si no hay sesión pero hay cookies
  if (!session && req.cookies.get('sb-access-token')) {
    await supabase.auth.refreshSession();
  }

  // Rutas protegidas (dashboard)
  if (req.nextUrl.pathname.startsWith('/ventas') ||
      req.nextUrl.pathname.startsWith('/compras') ||
      req.nextUrl.pathname.startsWith('/stock') ||
      req.nextUrl.pathname.startsWith('/clientes') ||
      req.nextUrl.pathname.startsWith('/caja') ||
      req.nextUrl.pathname.startsWith('/reportes') ||
      req.nextUrl.pathname.startsWith('/usuarios') ||
      req.nextUrl.pathname.startsWith('/configuracion')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Redirigir usuarios autenticados desde login/register a dashboard
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/ventas', req.url));
  }

  // Redirigir desde raíz a ventas si está autenticado
  if (req.nextUrl.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/ventas', req.url));
  }

  // Redirigir desde raíz a login si no está autenticado
  if (req.nextUrl.pathname === '/' && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/', '/ventas/:path*', '/compras/:path*', '/stock/:path*', '/clientes/:path*', '/caja/:path*', '/reportes/:path*', '/usuarios/:path*', '/configuracion/:path*', '/login', '/register'],
};
