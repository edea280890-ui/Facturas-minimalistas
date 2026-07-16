import React from 'react';
import Link from 'next/link';
import { getHotmartCheckoutUrl } from '@/utils/hotmart/config';

interface Plan {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  ctaLabel: string;
  /** Destino del CTA: ruta interna o URL absoluta (Hotmart). */
  href: string;
  external?: boolean;
  highlighted?: boolean;
}

/**
 * Tabla de precios de la landing pública. Presentacional: no consulta
 * Supabase ni Stripe. Tras el Portero Digital, el acceso a `/app` requiere
 * suscripción activa: el plan de entrada invita a iniciar sesión y el Pro
 * enlaza a Hotmart (o a `/login` si aún no hay URL de checkout).
 */
export default function HotmartPricingSection() {
  const hotmartUrl = getHotmartCheckoutUrl();

  const plans: Plan[] = [
    {
      name: 'Ya soy suscriptor',
      price: 'Acceso',
      priceNote: 'Con tu correo de compra',
      description: 'Si ya compraste el Plan Pro, inicia sesión con el mismo correo para entrar a la app.',
      features: [
        'Editor de facturas y PDF en vivo',
        'Descarga ilimitada de PDFs',
        'Guardado en la nube',
        'Panel Mis facturas',
      ],
      ctaLabel: 'Iniciar sesión',
      href: '/login',
    },
    {
      name: 'Plan Pro',
      price: '$15 USD',
      priceNote: 'Pago único — de por vida',
      description: 'Compra en Hotmart. El webhook te añade a la lista de acceso automáticamente.',
      features: [
        'Acceso completo a la aplicación',
        'Guarda tus facturas en la nube',
        'Historial: lista, edita y elimina',
        'Numeración automática secuencial',
        'Logo de tu empresa en el PDF',
      ],
      ctaLabel: 'Comprar ahora',
      href: hotmartUrl || '/login',
      external: Boolean(hotmartUrl),
      highlighted: true,
    },
  ];

  return (
    <section id="precios" className="scroll-mt-8 bg-slate-50 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Precios simples, sin sorpresas</h2>
          <p className="mt-3 text-slate-600">Empieza gratis. Actualiza cuando quieras guardar tus facturas en la nube.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {plans.map((plan) => {
            const className = plan.highlighted
              ? 'mt-6 block w-full rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100'
              : 'mt-6 block w-full rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800';

            return (
              <div
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'relative rounded-xl border-2 border-slate-900 bg-slate-900 p-6 text-white shadow-lg'
                    : 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm'
                }
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    Recomendado
                  </span>
                )}

                <h3
                  className={`text-sm font-semibold uppercase tracking-wider ${plan.highlighted ? 'text-slate-300' : 'text-slate-500'}`}
                >
                  {plan.name}
                </h3>
                <p className="mt-2 text-3xl font-bold">{plan.price}</p>
                <p className={`mt-1 text-sm ${plan.highlighted ? 'text-slate-300' : 'text-slate-500'}`}>{plan.priceNote}</p>
                <p className={`mt-4 text-sm ${plan.highlighted ? 'text-slate-200' : 'text-slate-600'}`}>{plan.description}</p>

                <ul className={`mt-6 space-y-2 text-sm ${plan.highlighted ? 'text-slate-200' : 'text-slate-600'}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className={plan.highlighted ? 'mt-0.5 text-emerald-400' : 'mt-0.5 text-emerald-600'}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.external ? (
                  <a href={plan.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {plan.ctaLabel}
                  </a>
                ) : (
                  <Link href={plan.href} className={className}>
                    {plan.ctaLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
