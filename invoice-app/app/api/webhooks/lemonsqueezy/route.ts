import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { upsertSubscriber } from '@/utils/subscribers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOG_PREFIX = '[lemonsqueezy]';

/**
 * Payload Lemon Squeezy (JSON:API).
 * Ref: https://docs.lemonsqueezy.com/help/webhooks/webhook-requests
 * Custom data: meta.custom_data (Order / Subscription / License events).
 */
interface LemonSqueezyWebhookPayload {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    type?: string;
    id?: string;
    attributes?: {
      user_email?: string;
      status?: string;
      order_number?: number;
      identifier?: string;
      first_order_item?: {
        product_name?: string;
      };
    };
  };
}

interface GrantPremiumResult {
  ok: boolean;
  userId: string;
  profileId?: string;
  isPremium?: boolean;
  error?: string;
  details?: string;
}

/**
 * GET /api/webhooks/lemonsqueezy
 *
 * Handshake / health check — confirma que el endpoint es público y alcanzable
 * desde Vercel (curl, navegador, o “Send test” de diagnóstico).
 */
export async function GET() {
  const requestId = randomUUID().slice(0, 8);
  const envReady = {
    LEMONSQUEEZY_WEBHOOK_SECRET: Boolean(process.env.LEMONSQUEEZY_WEBHOOK_SECRET),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  console.log(`${LOG_PREFIX} [${requestId}] HANDSHAKE GET — endpoint alcanzable`, JSON.stringify(envReady));

  return NextResponse.json(
    {
      ok: true,
      handshake: true,
      endpoint: '/api/webhooks/lemonsqueezy',
      methods: ['GET', 'POST'],
      requestId,
      envReady,
      hint: 'Lemon Squeezy debe enviar POST con header x-signature. Evento: order_created.',
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  const requestId = randomUUID().slice(0, 8);

  // Log síncrono inmediato — si esto no aparece en Vercel, la petición no llegó al Route Handler.
  console.log(
    `${LOG_PREFIX} [${requestId}] HANDSHAKE POST — función invocada`,
    JSON.stringify({ at: new Date().toISOString(), url: request.url }),
  );

  const log = (step: string, detail?: Record<string, unknown>) => {
    if (detail) {
      console.log(`${LOG_PREFIX} [${requestId}] ${step}`, JSON.stringify(detail));
    } else {
      console.log(`${LOG_PREFIX} [${requestId}] ${step}`);
    }
  };

  log('STEP 1 — Webhook recibido', {
    method: request.method,
    url: request.url,
    contentType: request.headers.get('content-type'),
    xEventName: request.headers.get('x-event-name'),
    hasSignature: Boolean(request.headers.get('x-signature')),
  });

  try {
    const rawBody = await request.text();
    log('STEP 2 — Body leído', { byteLength: rawBody.length });

    let body: LemonSqueezyWebhookPayload;
    try {
      body = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
    } catch (parseErr) {
      const message = parseErr instanceof Error ? parseErr.message : 'JSON inválido';
      console.error(`${LOG_PREFIX} [${requestId}] STEP 2 — ERROR parseando JSON:`, message);
      return NextResponse.json({ error: 'Invalid JSON body.', requestId }, { status: 400 });
    }

    log('STEP 3 — Payload parseado', {
      eventNameHeader: request.headers.get('x-event-name'),
      eventNameMeta: body.meta?.event_name,
      dataType: body.data?.type,
      dataId: body.data?.id,
      customDataKeys: body.meta?.custom_data ? Object.keys(body.meta.custom_data) : [],
      customData: body.meta?.custom_data ?? null,
      orderStatus: body.data?.attributes?.status,
      userEmail: body.data?.attributes?.user_email ?? null,
    });
    console.log(`${LOG_PREFIX} [${requestId}] DEBUG_WEBHOOK_PAYLOAD:`, JSON.stringify(body, null, 2));

    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error(`${LOG_PREFIX} [${requestId}] STEP 4 — ERROR: LEMONSQUEEZY_WEBHOOK_SECRET no configurado`);
      return NextResponse.json({ error: 'Webhook secret not configured.', requestId }, { status: 500 });
    }

    const signature = request.headers.get('x-signature');
    if (!signature) {
      console.error(`${LOG_PREFIX} [${requestId}] STEP 4 — ERROR: falta header x-signature`);
      return NextResponse.json({ error: 'Missing x-signature header.', requestId }, { status: 401 });
    }

    const signatureValid = verifyLemonSqueezySignature(rawBody, signature, webhookSecret);
    log('STEP 4 — Validación de firma HMAC', {
      valid: signatureValid,
      signatureLength: signature.length,
    });

    if (!signatureValid) {
      console.error(`${LOG_PREFIX} [${requestId}] STEP 4 — ERROR: firma inválida`);
      return NextResponse.json({ error: 'Invalid signature.', requestId }, { status: 401 });
    }

    const eventName =
      body.meta?.event_name?.trim() || request.headers.get('x-event-name')?.trim() || 'unknown';

    log('STEP 5 — Evento identificado', { eventName });

    if (eventName !== 'order_created') {
      log('STEP 5 — Evento ignorado (solo procesamos order_created)');
      return NextResponse.json({ received: true, ignored: eventName, requestId }, { status: 200 });
    }

    const orderStatus = body.data?.attributes?.status?.trim().toLowerCase();
    if (orderStatus && orderStatus !== 'paid') {
      log('STEP 6 — Orden no pagada, ignorando', { orderStatus });
      return NextResponse.json(
        { received: true, ignored: true, reason: 'order_not_paid', orderStatus, requestId },
        { status: 200 },
      );
    }

    log('STEP 6 — Estado de orden verificado', {
      orderStatus: orderStatus ?? 'paid',
      proceeding: true,
    });

    const userId = extractUserIdFromCustomData(body.meta?.custom_data);
    log('STEP 7 — Extracción de user_id', {
      userId: userId ?? null,
      rawCustomData: body.meta?.custom_data ?? null,
    });

    if (!userId) {
      console.error(`${LOG_PREFIX} [${requestId}] STEP 7 — ERROR: meta.custom_data.user_id ausente o inválido`, {
        customData: body.meta?.custom_data ?? null,
      });
      return NextResponse.json(
        {
          error: 'Missing or invalid meta.custom_data.user_id.',
          hint: 'El checkout debe incluir checkout[custom][user_id]=<uuid> (PremiumButton).',
          requestId,
        },
        { status: 400 },
      );
    }

    if (!isUuid(userId)) {
      console.error(`${LOG_PREFIX} [${requestId}] STEP 7 — ERROR: user_id no es UUID válido`, { userId });
      return NextResponse.json({ error: 'Invalid user_id format (expected UUID).', userId, requestId }, { status: 400 });
    }

    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseAdminClient();
      log('STEP 8 — Cliente Supabase admin inicializado');
    } catch (adminErr) {
      const message = adminErr instanceof Error ? adminErr.message : 'Supabase admin init failed';
      console.error(`${LOG_PREFIX} [${requestId}] STEP 8 — ERROR:`, message);
      return NextResponse.json({ error: 'Supabase admin env missing.', details: message, requestId }, { status: 500 });
    }

    const authUser = await verifyAuthUserExists(supabase, userId, requestId);
    if (!authUser.ok) {
      console.error(`${LOG_PREFIX} [${requestId}] STEP 9 — ERROR: usuario no existe en auth.users`, {
        userId,
        details: authUser.error,
      });
      return NextResponse.json(
        { error: 'User not found in Supabase Auth.', userId, details: authUser.error, requestId },
        { status: 404 },
      );
    }

    log('STEP 9 — Usuario verificado en auth.users', {
      userId,
      email: authUser.email ?? null,
    });

    const grantResult = await grantPremiumToUser(supabase, userId, requestId);
    if (!grantResult.ok) {
      console.error(`${LOG_PREFIX} [${requestId}] STEP 10 — ERROR actualizando profiles`, grantResult);
      return NextResponse.json(
        {
          error: 'Failed to update profiles.is_premium.',
          userId,
          details: grantResult.error,
          requestId,
        },
        { status: 500 },
      );
    }

    log('STEP 10 — profiles.is_premium actualizado', {
      userId: grantResult.userId,
      profileId: grantResult.profileId,
      isPremium: grantResult.isPremium,
    });

    const purchaseEmail = body.data?.attributes?.user_email?.trim().toLowerCase() ?? null;
    if (purchaseEmail) {
      try {
        await upsertSubscriber(supabase, purchaseEmail, 'active');
        log('STEP 11 — subscribers upsert OK', { purchaseEmail });
      } catch (subErr) {
        const message = subErr instanceof Error ? subErr.message : 'subscriber upsert failed';
        console.error(`${LOG_PREFIX} [${requestId}] STEP 11 — WARN subscribers upsert falló`, {
          purchaseEmail,
          error: message,
        });
      }
    } else {
      console.warn(`${LOG_PREFIX} [${requestId}] STEP 11 — WARN: sin data.attributes.user_email`);
    }

    log('STEP 12 — Webhook procesado con éxito', {
      userId,
      purchaseEmail,
      orderId: body.data?.id ?? null,
      orderIdentifier: body.data?.attributes?.identifier ?? null,
    });

    return NextResponse.json(
      {
        received: true,
        requestId,
        userId,
        premium: true,
        purchaseEmail,
        profileId: grantResult.profileId,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed.';
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`${LOG_PREFIX} [${requestId}] ERROR no controlado:`, message, stack);
    return NextResponse.json({ error: message, requestId }, { status: 500 });
  }
}

/**
 * Lemon Squeezy envía custom_data en meta.custom_data.
 * Los valores pueden ser string o number según cómo se pasaron en el checkout URL.
 */
function extractUserIdFromCustomData(customData?: Record<string, unknown>): string | null {
  if (!customData) return null;

  const raw =
    customData.user_id ??
    customData.userId ??
    customData['user-id'] ??
    null;

  if (raw == null) return null;

  const normalized = String(raw).trim();
  if (!normalized || normalized === 'undefined' || normalized === 'null') return null;

  return normalized;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function verifyAuthUserExists(
  supabase: SupabaseClient,
  userId: string,
  requestId: string,
): Promise<{ ok: boolean; email?: string; error?: string }> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) {
      console.error(`${LOG_PREFIX} [${requestId}] auth.admin.getUserById error:`, error.message);
      return { ok: false, error: error.message };
    }
    if (!data.user) {
      return { ok: false, error: 'No user returned from auth.admin.getUserById.' };
    }
    return { ok: true, email: data.user.email ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'auth lookup failed';
    return { ok: false, error: message };
  }
}

async function grantPremiumToUser(
  supabase: SupabaseClient,
  userId: string,
  requestId: string,
): Promise<GrantPremiumResult> {
  const { data: updatedRows, error: updateError } = await supabase
    .from('profiles')
    .update({ is_premium: true })
    .eq('id', userId)
    .select('id, is_premium');

  if (updateError) {
    console.error(`${LOG_PREFIX} [${requestId}] profiles UPDATE error:`, {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
    });
    return { ok: false, userId, error: updateError.message, details: updateError.details ?? undefined };
  }

  if (updatedRows && updatedRows.length > 0) {
    const row = updatedRows[0];
    if (!row.is_premium) {
      return {
        ok: false,
        userId,
        error: 'Update returned row but is_premium is still false.',
        profileId: row.id,
      };
    }
    return { ok: true, userId, profileId: row.id, isPremium: row.is_premium };
  }

  console.warn(`${LOG_PREFIX} [${requestId}] profiles UPDATE afectó 0 filas; intentando UPSERT`, { userId });

  const { data: upsertedRows, error: upsertError } = await supabase
    .from('profiles')
    .upsert({ id: userId, is_premium: true }, { onConflict: 'id' })
    .select('id, is_premium');

  if (upsertError) {
    console.error(`${LOG_PREFIX} [${requestId}] profiles UPSERT error:`, {
      code: upsertError.code,
      message: upsertError.message,
      details: upsertError.details,
      hint: upsertError.hint,
    });
    return { ok: false, userId, error: upsertError.message, details: upsertError.details ?? undefined };
  }

  const upserted = upsertedRows?.[0];
  if (!upserted?.is_premium) {
    return {
      ok: false,
      userId,
      error: 'Upsert completed but is_premium is not true.',
      profileId: upserted?.id,
    };
  }

  return { ok: true, userId, profileId: upserted.id, isPremium: upserted.is_premium };
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
