import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { MissingEnvVarError } from '@/utils/env';
import AdminSubscribersClient from '@/components/admin/AdminSubscribersClient';
import AdminConfigError from '@/components/admin/AdminConfigError';
import type { Subscriber } from '@/utils/subscribers';

export const dynamic = 'force-dynamic';

type LoadResult = { ok: true; rows: Subscriber[] } | { ok: false; message: string; hint?: string };

/**
 * Carga los suscriptores con el cliente Service Role. Devuelve un resultado
 * plano (sin JSX) para que ningún `try/catch` envuelva la construcción de
 * componentes — así el render sigue siendo manejado por los límites de error
 * normales de React/Next.js, y solo los fallos de datos/config quedan acá.
 *
 * `SUPABASE_SERVICE_ROLE_KEY` es una variable privada real, sin fallback en
 * código (a diferencia de la URL/anon key públicas en `utils/env.ts`). Si
 * Vercel no la inyecta, `getSupabaseAdminClient()` lanza; antes ese throw no
 * se capturaba aquí y producía un 500 sin contexto en `/admin`.
 */
async function loadSubscribers(): Promise<LoadResult> {
  let admin;
  try {
    admin = getSupabaseAdminClient();
  } catch (err) {
    console.error('[admin] getSupabaseAdminClient() falló:', err);
    const message =
      err instanceof MissingEnvVarError
        ? `Configuración incompleta en el servidor: ${err.message}`
        : 'No se pudo inicializar el cliente de administración de Supabase.';
    return {
      ok: false,
      message,
      hint: 'Verifica SUPABASE_SERVICE_ROLE_KEY en Vercel → Project Settings → Environment Variables (entorno Production).',
    };
  }

  try {
    const { data, error } = await admin
      .from('subscribers')
      .select('email, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        ok: false,
        message: `Error cargando datos: ${error.message}`,
        hint: 'Si la tabla no existe, ejecuta invoice-app/supabase/subscribers.sql en el SQL Editor de Supabase.',
      };
    }

    return { ok: true, rows: (data ?? []) as Subscriber[] };
  } catch (err) {
    console.error('[admin] Error inesperado al cargar suscriptores:', err);
    return { ok: false, message: 'Ocurrió un error inesperado al cargar el panel.' };
  }
}

/**
 * Panel de Administración — lista de suscriptores del Portero Digital.
 * La autenticación/autorización (sesión + `ADMIN_EMAILS`) ya la exige
 * `app/admin/layout.tsx` vía `requireAdminOrRedirect()` — no se repite aquí.
 */
export default async function AdminPage() {
  const result = await loadSubscribers();

  if (!result.ok) {
    return <AdminConfigError message={result.message} hint={result.hint} />;
  }

  const activeCount = result.rows.filter((s) => s.status === 'active').length;

  return (
    <AdminSubscribersClient
      initialSubscribers={result.rows}
      initialActiveCount={activeCount}
      initialTotalCount={result.rows.length}
    />
  );
}
