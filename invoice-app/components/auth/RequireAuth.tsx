'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Envuelve rutas que requieren sesión activa. Como la app es enteramente
 * client-side (sin @supabase/ssr), la protección se aplica en el cliente:
 * mientras se resuelve la sesión se muestra un estado de carga y, si no hay
 * sesión, un CTA para iniciar sesión desde la página principal.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const session = useAuthStore((s) => s.session);
  const sessionLoaded = useAuthStore((s) => s.sessionLoaded);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!sessionLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Comprobando sesión...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-600">Debes iniciar sesión para ver esta página.</p>
        <Link
          href="/app"
          className="text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Volver e iniciar sesión
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
