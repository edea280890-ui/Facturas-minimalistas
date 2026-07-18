'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useToastStore } from '@/store/useToastStore';
import { useUpgradeCheckout } from '@/hooks/useUpgradeCheckout';
import PremiumButton from '@/components/PremiumButton';
import { PRO_PRICE_USD_LABEL } from '@/utils/stripe/constants';

const FREE_FEATURES = [
  'Facturas ilimitadas',
  'Previsualización en PDF en vivo',
  'Descarga en PDF con un clic',
  'Multi-divisa e impuestos configurables',
];

const PRO_FEATURES = [
  'Todo lo del plan Gratis',
  'Guardar facturas en la nube',
  'Panel "Mis facturas": listar, editar y eliminar',
  'Numeración automática secuencial',
  'Logo personalizado de tu empresa en el PDF',
  'Acceso Ilimitado, sin suscripción',
];

export default function PricingSection() {
  const session = useAuthStore((s) => s.session);
  const isPremium = useProfileStore((s) => s.isPremium);
  const profileLoaded = useProfileStore((s) => s.profileLoaded);
  const showToast = useToastStore((s) => s.showToast);
  const { upgrading, startCheckout } = useUpgradeCheckout();

  const handleProClick = () => {
    // Lemon Squeezy requiere sesión (custom user_id → webhook → profiles.is_premium).
    if (!session) {
      showToast('info', 'Inicia sesión desde el botón "Iniciar Sesión" arriba y vuelve a intentarlo.');
      return;
    }
    startCheckout();
  };

  const isCurrentlyPro = session && profileLoaded && isPremium;

  return (
    <section id="precios" className="mt-16 scroll-mt-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Precios simples, sin sorpresas</h2>
        <p className="mt-1 text-slate-500">Empieza gratis. Actualiza cuando quieras guardar tus facturas en la nube.</p>
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Gratis</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">$0</p>
          <p className="mt-1 text-sm text-slate-500">Acceso Ilimitado</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-xl border-2 border-slate-900 bg-slate-900 p-6 text-white shadow-lg">
          <span className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
            Recomendado
          </span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Pro</h3>
          <p className="mt-2 text-3xl font-bold">{PRO_PRICE_USD_LABEL} USD</p>
          <p className="mt-1 text-sm text-slate-300">Plan Ilimitado, sin renovaciones</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-200">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-400">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {isCurrentlyPro ? (
            <div className="mt-6 rounded-lg bg-emerald-500/10 px-4 py-2 text-center text-sm font-medium text-emerald-300">
              Ya tienes acceso Pro ✓
            </div>
          ) : session?.user?.id ? (
            <PremiumButton
              userId={session.user.id}
              className="mt-6 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:opacity-50"
            />
          ) : (
            <button
              onClick={handleProClick}
              disabled={upgrading}
              className="mt-6 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              {upgrading ? 'Redirigiendo…' : `Actualizar a Pro (${PRO_PRICE_USD_LABEL})`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
