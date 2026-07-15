import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export interface AuthenticatedUserResult {
  user: User | null;
  error: string | null;
}

/**
 * Resuelve el usuario autenticado a partir del header `Authorization: Bearer <access_token>`
 * que el cliente debe enviar en cada petición a un Route Handler. Se valida el JWT
 * contra la API de Supabase Auth usando la anon key (no requiere Service Role Key).
 */
export async function getUserFromRequest(request: Request): Promise<AuthenticatedUserResult> {
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    return { user: null, error: 'Falta el token de autenticación.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, error: 'Configuración de Supabase incompleta en el servidor.' };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { user: null, error: 'Sesión inválida o expirada.' };
  }

  return { user: data.user, error: null };
}
