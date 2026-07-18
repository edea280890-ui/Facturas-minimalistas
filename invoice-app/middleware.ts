import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';

/**
 * Middleware mínimo: refresca sesión Supabase en cookies.
 * Los webhooks externos (/api/webhooks/*) se excluyen del refresco de sesión
 * para evitar interferencias con POST sin cookies; solo se registra el paso.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/webhooks/')) {
    console.log('[middleware] Webhook bypass', {
      method: request.method,
      pathname,
      userAgent: request.headers.get('user-agent'),
      contentType: request.headers.get('content-type'),
    });
    return NextResponse.next();
  }

  const { supabase, supabaseResponse } = await createSupabaseMiddlewareClient(request);

  if (supabase) {
    try {
      await supabase.auth.getUser();
    } catch (err) {
      console.error('[middleware] Error al refrescar la sesión:', err);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
