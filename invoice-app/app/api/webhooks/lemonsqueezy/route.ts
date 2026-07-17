import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { upsertSubscriber } from '@/utils/subscribers';

export const runtime = 'nodejs';

/**
 * Payload mínimo que necesitamos del webhook de Lemon Squeezy.
 * Ref: https://docs.lemonsqueezy.com/help/webhooks
 */
interface LemonSqueezyWebhookPayload {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data?: {
    attributes?: {
      user_email?: string;
      status?: string;
      first_order_item?: {
        product_name?: string;
      };
    };
  };
}

/**
 * POST /api/webhooks/lemonsqueezy
 *
 * Verifica la firma HMAC-SHA256 (`x-signature`) y, en `order_created`,
 * marca `profiles.is_premium = true` para el `user_id` enviado en
 * `meta.custom_data.user_id` (inyectado desde PremiumButton).
 */
export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[lemonsqueezy] LEMONSQUEEZY_WEBHOOK_SECRET no está configurado.');
      return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
    }

    const signature = request.headers.get('x-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing x-signature header.' }, { status: 401 });
    }

    const rawBody = await request.text();
    if (!verifyLemonSqueezySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
    const eventName = payload.meta?.event_name;

    if (eventName !== 'order_created') {
      return NextResponse.json({ received: true, ignored: eventName ?? 'unknown' }, { status: 200 });
    }

    const userId = payload.meta?.custom_data?.user_id?.trim();
    if (!userId) {
      console.error('[lemonsqueezy] order_created sin meta.custom_data.user_id');
      return NextResponse.json({ error: 'Missing custom_data.user_id.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[lemonsqueezy] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
      return NextResponse.json({ error: 'Supabase admin env missing.' }, { status: 500 });
    }

    const supabase: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId);

    if (profileError) {
      console.error('[lemonsqueezy] Error actualizando profiles:', profileError.message);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Mantener el Portero Digital alineado (subscribers por email).
    const email =
      payload.data?.attributes?.user_email?.trim().toLowerCase() ??
      (await resolveUserEmail(supabase, userId));
    if (email) {
      try {
        await upsertSubscriber(supabase, email, 'active');
      } catch (subErr) {
        console.error('[lemonsqueezy] No se pudo upsert subscribers:', subErr);
      }
    }

    return NextResponse.json({ received: true, userId, premium: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed.';
    console.error('[lemonsqueezy] Error no controlado:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function verifyLemonSqueezySignature(rawBody: string, signature: string, secret: string): boolean {
  const digest = createHmac('sha256', secret).update(rawBody).digest('hex');
  const digestBuf = Buffer.from(digest, 'utf8');
  const signatureBuf = Buffer.from(signature, 'utf8');

  if (digestBuf.length !== signatureBuf.length) {
    return false;
  }

  return timingSafeEqual(digestBuf, signatureBuf);
}

async function resolveUserEmail(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !data.user?.email) return null;
    return data.user.email.trim().toLowerCase();
  } catch {
    return null;
  }
}
