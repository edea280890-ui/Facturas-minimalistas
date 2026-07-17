import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { requireEnv } from '@/utils/env';
import { sanitizeNextPath } from '@/utils/supabase/authRedirect';

export const runtime = 'nodejs';

/**
 * GET /auth/callback
 *
 * Intercambia el `?code=` del Magic Link (PKCE) por una sesión y la persiste
 * en cookies HTTP vía @supabase/ssr. Soporta `?next=` para el destino final.
 *
 * - Éxito → `next` (sanitizado) o `/dashboard` por defecto
 * - Fallo → `/login?error=auth_failed`
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as 'email' | 'recovery' | 'signup' | null;
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get('next'));
  const origin = requestUrl.origin;

  const redirectToLoginFailed = () =>
    NextResponse.redirect(new URL('/login?error=auth_failed', origin));

  if (!code && !(tokenHash && type)) {
    return redirectToLoginFailed();
  }

  try {
    const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    const redirectResponse = NextResponse.redirect(new URL(nextPath, origin));

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    let authError: { message: string; code?: string } | null = null;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      authError = error;
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      authError = error;
    }

    // @supabase/supabase-js ≥2.91 puede diferir el evento SIGNED_IN; esperar un
    // tick asegura que setAll persista las cookies antes del redirect en serverless.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    if (authError) {
      console.error('[auth/callback] auth exchange failed:', authError.message, authError.code);
      return redirectToLoginFailed();
    }

    return redirectResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[auth/callback] unexpected error:', message);
    return redirectToLoginFailed();
  }
}
