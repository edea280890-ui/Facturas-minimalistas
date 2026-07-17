/** Destino por defecto tras un Magic Link exitoso. */
export const DEFAULT_POST_LOGIN_PATH = '/dashboard';

/**
 * Evita open-redirects: solo rutas relativas internas (`/ruta`).
 */
export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next) return DEFAULT_POST_LOGIN_PATH;
  if (!next.startsWith('/') || next.startsWith('//')) return DEFAULT_POST_LOGIN_PATH;
  return next;
}

/**
 * URL del callback de Supabase con destino post-login opcional.
 * Usar en `signInWithOtp({ options: { emailRedirectTo } })` en el cliente.
 */
export function buildAuthCallbackUrl(nextPath?: string | null): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const safeNext = sanitizeNextPath(nextPath);
  const url = new URL('/auth/callback', origin || 'http://localhost');
  url.searchParams.set('next', safeNext);
  return url.toString();
}
