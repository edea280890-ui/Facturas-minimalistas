import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { requireEnv } from '@/utils/env';

export const runtime = 'nodejs';

/**
 * GET /auth/callback
 *
 * Intercambia el `?code=` del Magic Link (PKCE) por una sesión y la persiste
 * en cookies HTTP vía @supabase/ssr (las cookies se escriben en la Response
 * de redirect, no solo en el cookie store mutable).
 *
 * - Éxito → `/admin`
 * - Fallo (otp_expired, invalid_token, sin code, etc.) → `/login?error=auth_failed`
 *   Nunca redirige a `/` con errores en la query.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  const redirectToLoginFailed = () =>
    NextResponse.redirect(new URL('/login?error=auth_failed', origin));

  if (!code) {
    return redirectToLoginFailed();
  }

  try {
    const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    // Response provisional: exchangeCodeForSession escribe cookies aquí.
    const redirectResponse = NextResponse.redirect(new URL('/admin', origin));

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          // Leer del request entrante
          const cookieHeader = request.headers.get('cookie') ?? '';
          if (!cookieHeader) return [];
          return cookieHeader.split(';').map((pair) => {
            const [name, ...rest] = pair.trim().split('=');
            return { name, value: rest.join('=') };
          });
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message, error.code);
      return redirectToLoginFailed();
    }

    return redirectResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[auth/callback] unexpected error:', message);
    return redirectToLoginFailed();
  }
}
