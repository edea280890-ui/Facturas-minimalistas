'use client';

import React from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { getHotmartCheckoutUrl } from '@/utils/hotmart/config';

/**
 * Página a la que redirige el Portero cuando el usuario está logueado pero
 * su email no está en `subscribers` con status `active`.
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
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Acceso restringido</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Tu cuenta no tiene acceso activo</h1>
        <p className="mt-3 text-sm text-slate-500">
          Este servicio es exclusivo para suscriptores. Si ya compraste el Plan Pro, inicia sesión con el
          mismo correo de la compra. Si aún no lo tienes, adquiérelo ahora.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {hotmartUrl ? (
            <a
              href={hotmartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Ir a comprar en Hotmart
            </a>
          ) : (
            <Link
              href="/#precios"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Ver precios
            </Link>
          )}
          <Link
            href="/login"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Probar con otro correo
          </Link>
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
