import { type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';

/**
 * Middleware mínimo: solo refresca la sesión de Supabase en cookies.
 *
 * - Permite SIEMPRE `/auth/callback` (sin redirects) para evitar bucles
 *   y para que el Route Handler pueda hacer `exchangeCodeForSession`.
 * - NO protege rutas aquí (eso lo hacen los layouts vía `utils/portero.ts`).
 *   Meter gates de negocio en middleware + @supabase/ssr en Next 16/Vercel
 *   ha causado 404 globales en este proyecto.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paso explícito y sin lógica de auth de negocio.
  if (pathname.startsWith('/auth/callback')) {
    const { supabase, supabaseResponse } = await createSupabaseMiddlewareClient(request);
    // Toca getUser para forzar refresh de cookies si hace falta.
    await supabase.auth.getUser();
    return supabaseResponse;
  }

  const { supabase, supabaseResponse } = await createSupabaseMiddlewareClient(request);
  await supabase.auth.getUser();
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Excluye estáticos. Incluye /auth/callback explícitamente vía el patrón.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
