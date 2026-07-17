'use client';

import React from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { getHotmartCheckoutUrl } from '@/utils/hotmart/config';

/**
 * Página a la que redirige el Portero cuando el usuario está logueado pero
 * intenta entrar a una función exclusiva del Plan Pro (hoy: "Mis facturas" /
 * guardado en la nube, en `/dashboard`) sin tener una suscripción activa.
 *
 * IMPORTANTE: esto NO significa que el usuario no pueda usar la app. El
 * Plan Gratuito (crear, previsualizar y descargar facturas) sigue disponible
 * sin restricciones en `/app` — por eso ese enlace debe estar siempre
 * visible aquí, funcional y sin fricción.
 */
export default function AccesoDenegadoPage() {
  const hotmartUrl = getHotmartCheckoutUrl();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[acceso-denegado] No se pudo cerrar sesión:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Función Pro</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Esto requiere el Plan Pro</h1>
        <p className="mt-3 text-sm text-slate-500">
          Guardar facturas en la nube y el panel &quot;Mis facturas&quot; son parte del Plan Pro. Puedes
          seguir usando el <strong>Plan Gratuito</strong> para crear, previsualizar y descargar facturas sin
          ningún costo — no necesitas comprar nada para eso.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/app"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Continuar con el Plan Gratuito
          </Link>
          {hotmartUrl ? (
            <a
              href={hotmartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Actualizar a Pro en Hotmart
            </a>
          ) : (
            <Link
              href="/app#precios"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Ver precios del Plan Pro
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-slate-500 underline hover:text-slate-800"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </main>
  );
}
