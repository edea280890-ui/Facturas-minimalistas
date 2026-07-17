import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/utils/adminEmails';
import { upsertSubscriber } from '@/utils/subscribers';
import { MissingEnvVarError } from '@/utils/env';

export const runtime = 'nodejs';

const SERVICE_UNAVAILABLE = NextResponse.json(
  { error: 'Servicio no disponible (configuración incompleta en el servidor).' },
  { status: 503 },
);

async function requireAdmin() {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (err) {
    if (!(err instanceof MissingEnvVarError)) throw err;
    console.error('[api/admin/subscribers] createSupabaseServerClient() falló:', err.message);
    return { error: SERVICE_UNAVAILABLE, user: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmail(user.email)) {
    return { error: NextResponse.json({ error: 'No autorizado.' }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

/**
 * Cliente Service Role, sin lanzar: si `SUPABASE_SERVICE_ROLE_KEY` no está
 * inyectada en Vercel, devuelve un 503 controlado en vez de un 500.
 */
function getAdminClientOrError() {
  try {
    return { admin: getSupabaseAdminClient(), error: null };
  } catch (err) {
    console.error('[api/admin/subscribers] getSupabaseAdminClient() falló:', err);
    return { admin: null, error: SERVICE_UNAVAILABLE };
  }
}

/**
 * GET /api/admin/subscribers — lista completa (solo admin).
 */
export async function GET() {
  const { error, user } = await requireAdmin();
  if (error || !user) return error!;

  const { admin, error: adminError } = getAdminClientOrError();
  if (adminError || !admin) return adminError!;

  try {
    const { data, error: queryError } = await admin
      .from('subscribers')
      .select('email, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    const subscribers = data ?? [];
    const activeCount = subscribers.filter((s) => s.status === 'active').length;

    return NextResponse.json({
      activeCount,
      totalCount: subscribers.length,
      subscribers,
    });
  } catch (err) {
    console.error('[api/admin/subscribers] GET error inesperado:', err);
    return NextResponse.json({ error: 'Error inesperado al listar suscriptores.' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/subscribers — dar de baja o reactivar.
 * Body: { email: string, status: 'active' | 'canceled' }
 */
export async function PATCH(request: Request) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error!;

  const { admin, error: adminError } = getAdminClientOrError();
  if (adminError || !admin) return adminError!;

  try {
    const body = (await request.json()) as { email?: string; status?: string };
    const email = body.email?.trim().toLowerCase();
    const status = body.status === 'active' ? 'active' : body.status === 'canceled' ? 'canceled' : null;

    if (!email || !status) {
      return NextResponse.json({ error: 'Se requieren email y status (active|canceled).' }, { status: 400 });
    }

    await upsertSubscriber(admin, email, status);

    // Sincronizar profiles.is_premium con el estado del suscriptor.
    const perPage = 200;
    let userId: string | null = null;
    for (let page = 1; page <= 50; page += 1) {
      const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage });
      if (listError) throw listError;
      const match = data.users.find((u) => u.email?.toLowerCase() === email);
      if (match) {
        userId = match.id;
        break;
      }
      if (data.users.length < perPage) break;
    }

    if (userId) {
      const { error: profileError } = await admin
        .from('profiles')
        .update({ is_premium: status === 'active' })
        .eq('id', userId);
      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, email, status });
  } catch (err) {
    console.error('[api/admin/subscribers] PATCH error inesperado:', err);
    const message = err instanceof Error ? err.message : 'Error inesperado al actualizar el suscriptor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
