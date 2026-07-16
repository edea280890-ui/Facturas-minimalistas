'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Capa client-side de respaldo. El Portero Digital (middleware) ya exige
 * sesión + suscriptor activo; este componente cubre el caso de hidratación.
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
          href="/login"
          className="text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
