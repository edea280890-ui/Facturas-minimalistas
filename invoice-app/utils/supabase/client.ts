import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';

let cachedClient: SupabaseClient | null = null;
let configError: string | null = null;

/**
 * Crea (una sola vez) el cliente de navegador de Supabase.
 *
 * IMPORTANTE: esto NUNCA se ejecuta en la evaluación del módulo. Antes,
 * `createBrowserClient(...)` se llamaba a nivel superior del archivo, lo que
 * lanzaba un `Uncaught Error` en cuanto el bundle se cargaba en el navegador
 * si faltaban `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` —
 * y como este módulo se importa desde `useAuthStore` (montado globalmente
 * vía `ProfileSync` en el layout raíz), eso rompía el render de TODAS las
 * páginas. Ahora la construcción es perezosa: solo ocurre la primera vez que
 * algo intenta usar `supabase.auth.*`, típicamente dentro de un manejador de
 * evento o un `try/catch`, donde el error puede controlarse.
 */
function getOrCreateClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  if (configError) return null;

  const supabaseUrl = env('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = env('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    configError = 'Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.';
    console.error(`[supabase/client] ${configError}`);
    return null;
  }

  try {
    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return cachedClient;
  } catch (err) {
    configError = err instanceof Error ? err.message : 'No se pudo inicializar Supabase.';
    console.error('[supabase/client]', configError);
    return null;
  }
}

/** Úsalo para mostrar un aviso en la UI en vez de dejar que algo falle más adelante. */
export function isSupabaseConfigured(): boolean {
  return getOrCreateClient() !== null;
}

export function getSupabaseConfigError(): string | null {
  getOrCreateClient();
  return configError;
}

/**
 * Proxy perezoso: acceder a `supabase` (p. ej. importar este módulo) nunca
 * lanza. Solo lanza — con un mensaje controlado — cuando algo llama a un
 * método real (`supabase.auth.signInWithOtp(...)`, etc.) y la configuración
 * sigue faltando. Todo el código que ya invoca `supabase.auth.*` lo hace
 * dentro de manejadores async con try/catch (ver `store/useAuthStore.ts`,
 * `components/layout/Header.tsx`, `app/login/page.tsx`).
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getOrCreateClient();
    if (!client) {
      throw new Error(configError ?? 'Supabase no está configurado.');
    }
    return Reflect.get(client, prop, receiver);
  },
});
