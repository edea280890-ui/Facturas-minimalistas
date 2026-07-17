'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { getHotmartCheckoutUrl } from '@/utils/hotmart/config';

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (errorParam === 'auth_failed') {
      return 'El enlace de acceso expiró o no es válido. Solicita uno nuevo.';
    }
    if (errorParam === 'service_unavailable') {
      return 'El servicio de inicio de sesión no está disponible en este momento. Inténtalo más tarde.';
    }
    return null;
  });
  const hotmartUrl = getHotmartCheckoutUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // Callback limpio: el Route Handler decide el destino (/app).
          emailRedirectTo:
            typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (otpError) throw otpError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-slate-500">
        Te enviamos un enlace mágico a tu correo — sin contraseña. El Plan Gratuito no necesita cuenta;
        inicia sesión solo si quieres guardar facturas en la nube (Plan Pro) o gestionar tu cuenta.
      </p>

      {sent ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Enlace enviado a <strong>{email}</strong>. Revisa tu bandeja (y spam) para entrar.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Enviando…' : 'Enviar enlace mágico'}
          </button>
        </form>
      )}

      <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
        <Link href="/app" className="font-semibold text-slate-900 underline">
          Continuar con el Plan Gratuito sin iniciar sesión
        </Link>
        <p className="mt-4">¿Quieres guardar tus facturas en la nube?</p>
        {hotmartUrl ? (
          <a
            href={hotmartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block font-semibold text-slate-900 underline"
          >
            Comprar Plan Pro en Hotmart
          </a>
        ) : (
          <Link href="/#precios" className="mt-1 inline-block font-semibold text-slate-900 underline">
            Ver precios
          </Link>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <Suspense fallback={<div className="text-sm text-slate-500">Cargando…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
