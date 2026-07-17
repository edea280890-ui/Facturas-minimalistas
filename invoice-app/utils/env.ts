/**
 * BYPASS TEMPORAL — el panel de Vercel no está inyectando las env vars en
 * producción. Estos son valores públicos de Supabase (URL + anon key): ya
 * viajan al navegador en cualquier despliegue funcional (por eso llevan el
 * prefijo `NEXT_PUBLIC_`) y están protegidos por las políticas RLS de la
 * base, no por ser secretos. Por eso, y solo por eso, es aceptable tenerlos
 * como fallback aquí mientras se corrige la configuración real en Vercel
 * (Project Settings → Environment Variables → verificar que estén guardadas
 * en el entorno "Production" y sin espacios/saltos de línea).
 *
 * NUNCA agregues aquí `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
 * `STRIPE_WEBHOOK_SECRET`, `HOTMART_HOTTOK` ni `ADMIN_EMAILS`: esos sí son
 * secretos reales y un fallback en código los deja expuestos para siempre
 * en el historial de git. Si alguno de esos falta en Vercel, se arregla en
 * el dashboard, no en código.
 */
const PUBLIC_ENV_FALLBACKS: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://knntlcstoiecozpzvapd.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnRsY3N0b2llY296cHp2YXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwODk5MTUsImV4cCI6MjA5OTY2NTkxNX0._YbhTPyyPU7J4nwZWiWz8JL8UIavp4n0FYK06UIRW6o',
};

/**
 * Lectura segura de variables de entorno (trim de espacios / saltos
 * que a veces se cuelan al pegar secretos en Vercel). Si `process.env[name]`
 * viene vacío y `name` es una de las dos claves públicas de Supabase, cae al
 * fallback anterior en vez de quedar en `''`.
 */
export function env(name: string): string {
  const value = process.env[name];
  const trimmed = value == null ? '' : value.trim();
  return trimmed || PUBLIC_ENV_FALLBACKS[name] || '';
}

/**
 * Error identificable (no un `Error` genérico) para que el código que llama
 * a `requireEnv` pueda distinguirlo de otras excepciones — en particular de
 * las señales internas de control de flujo de Next.js (`redirect()`,
 * `notFound()`, `DYNAMIC_SERVER_USAGE` por usar `cookies()`), que NUNCA se
 * deben capturar/silenciar con un `catch` genérico.
 */
export class MissingEnvVarError extends Error {
  constructor(name: string) {
    super(`Falta la variable de entorno ${name}.`);
    this.name = 'MissingEnvVarError';
  }
}

export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) {
    throw new MissingEnvVarError(name);
  }
  return value;
}
