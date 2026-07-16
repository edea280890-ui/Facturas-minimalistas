import { NextResponse } from 'next/server';
import { getStripeServerClient } from '@/utils/stripe/server';
import { getUserFromRequest } from '@/utils/supabase/getUserFromRequest';
import { PRO_PRODUCT_NAME, PRO_PRICE_USD_CENTS } from '@/utils/stripe/constants';

export const runtime = 'nodejs';

/**
 * POST /api/checkout
 *
 * Crea una sesión de Stripe Checkout (pago único de $15 USD) para el usuario
 * autenticado que hace la petición, y devuelve la URL a la que redirigirlo.
 *
 * El cliente debe enviar `Authorization: Bearer <access_token>` (el token de
 * la sesión actual de Supabase); este endpoint valida ese token contra
 * Supabase Auth para saber con certeza qué usuario está pagando, y guarda su
 * id en `metadata.supabase_user_id` para que el webhook pueda actualizar el
 * perfil correcto cuando el pago se complete.
 */
export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError ?? 'Debes iniciar sesión para continuar.' },
        { status: 401 },
      );
    }

    const stripe = getStripeServerClient();

    const origin =
      request.headers.get('origin') ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: PRO_PRODUCT_NAME,
              description: 'Acceso de por vida a guardar y gestionar facturas en la nube.',
            },
            unit_amount: PRO_PRICE_USD_CENTS,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email ?? undefined,
      metadata: {
        supabase_user_id: user.id,
      },
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=cancelled`,
    });

    if (!checkoutSession.url) {
      throw new Error('Stripe no devolvió una URL de checkout.');
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo iniciar el proceso de pago. Inténtalo de nuevo.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
