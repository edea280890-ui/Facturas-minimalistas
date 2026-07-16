'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';

type CallbackStatus = 'processing' | 'success' | 'error';

/**
 * Página de retorno del Magic Link de Supabase.
 *
 * Soporta los dos flujos que puede usar Supabase Auth:
 * - PKCE: la URL trae `?code=...`, que se intercambia explícitamente por una sesión.
 * - Implícito: la URL trae el token en el fragmento (#access_token=...), que el
 *   cliente de navegador (creado con `detectSessionInUrl: true`) ya procesa solo
 *   al cargar la página; aquí simplemente esperamos a que la sesión aparezca.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [message, setMessage] = useState('Confirmando tu sesión...');

  useEffect(() => {
    let cancelled = false;

    const finish = (ok: boolean, text: string) => {
      if (cancelled) return;
      setStatus(ok ? 'success' : 'error');
      setMessage(text);
      if (ok) {
        setTimeout(() => router.replace('/app'), 1200);
      }
    };

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          finish(true, 'Sesión confirmada. Redirigiendo...');
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          finish(true, 'Sesión confirmada. Redirigiendo...');
        } else {
          finish(false, 'No se encontró información de sesión en el enlace. Solicita un nuevo enlace mágico.');
        }
      } catch (err) {
        const text = err instanceof Error ? err.message : 'No se pudo confirmar el enlace de acceso.';
        finish(false, text);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-slate-900">Acceso con enlace mágico</h1>
        <p className={status === 'error' ? 'text-red-600' : 'text-slate-500'}>{message}</p>
        {status === 'error' && (
          <Link
            href="/app"
            className="mt-4 inline-block text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        )}
      </div>
    </main>
  );
}
