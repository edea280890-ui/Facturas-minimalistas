import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/utils/adminEmails';
import { upsertSubscriber } from '@/utils/subscribers';

export const runtime = 'nodejs';

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmail(user.email)) {
    return { error: NextResponse.json({ error: 'No autorizado.' }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

/**
 * GET /api/admin/subscribers — lista completa (solo admin).
 */
export async function GET() {
  const { error, user } = await requireAdmin();
  if (error || !user) return error!;

  const admin = getSupabaseAdminClient();
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
}

/**
 * PATCH /api/admin/subscribers — dar de baja o reactivar.
 * Body: { email: string, status: 'active' | 'canceled' }
 */
export async function PATCH(request: Request) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error!;

  const body = (await request.json()) as { email?: string; status?: string };
  const email = body.email?.trim().toLowerCase();
  const status = body.status === 'active' ? 'active' : body.status === 'canceled' ? 'canceled' : null;

  if (!email || !status) {
    return NextResponse.json({ error: 'Se requieren email y status (active|canceled).' }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
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
}
