'use client';

import { isSupabaseConfigured } from '@/utils/supabase/client';

/**
 * Aviso controlado (no un 500 ni un "Uncaught Error" en consola) para cuando
 * faltan las variables de entorno de Supabase en este despliegue.
 *
 * `NEXT_PUBLIC_*` se inlinean en build time, así que el resultado es
 * determinista entre servidor y cliente (sin riesgo de mismatch de
 * hidratación) — no hace falta useEffect/useState para calcularlo.
 */
export default function SupabaseConfigBanner() {
  let configured = true;
  try {
    configured = isSupabaseConfigured();
  } catch {
    configured = false;
  }

  if (configured) return null;

  return (
    <div
      role="alert"
      className="w-full bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
    >
      Configuración incompleta: faltan las variables de entorno de Supabase. El inicio de sesión
      no está disponible en este momento.
    </div>
  );
}
