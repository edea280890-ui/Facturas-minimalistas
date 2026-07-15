import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

/**
 * Cliente de Stripe para uso exclusivamente en el servidor (Route Handlers).
 * Nunca debe importarse desde un componente 'use client'.
 */
export function getStripeServerClient(): Stripe {
  if (stripeSingleton) return stripeSingleton;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'Falta STRIPE_SECRET_KEY. Configúrala como variable de entorno del servidor (no debe llevar el prefijo NEXT_PUBLIC_).',
    );
  }

  stripeSingleton = new Stripe(secretKey, {
    typescript: true,
  });
  return stripeSingleton;
}
