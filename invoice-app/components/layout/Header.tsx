'use client';

import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';
import { useInvoiceStore } from '@/store/useInvoiceStore';

type Status = { type: 'idle' | 'success' | 'error'; message: string };

export default function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' });

  const saveInvoiceToCloud = useInvoiceStore((s) => s.saveInvoiceToCloud);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) setSession(data.session);
      })
      .catch(() => {
        if (mounted) setSession(null);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'idle', message: '' });
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setStatus({ type: 'success', message: 'Enlace enviado. Revisa tu correo para iniciar sesión.' });
      setEmail('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo enviar el enlace de acceso.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setStatus({ type: 'idle', message: '' });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cerrar la sesión.';
      setStatus({ type: 'error', message });
    }
  };

  const handleSave = async () => {
    setStatus({ type: 'idle', message: '' });
    setSaving(true);
    try {
      const result = await saveInvoiceToCloud();
      if (result.error) {
        setStatus({ type: 'error', message: result.error });
      } else {
        setStatus({ type: 'success', message: 'Factura guardada en la nube correctamente.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const btnPrimary =
    'text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50';
  const btnGhost =
    'text-sm font-medium px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50';

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Generador de Facturas</h1>
          <p className="text-slate-500">Completar datos y exportar a PDF</p>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">{session.user.email}</span>
              <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving ? 'Guardando…' : 'Guardar en la nube'}
              </button>
              <button onClick={handleSignOut} className={btnGhost}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button onClick={() => setShowLogin((v) => !v)} className={btnPrimary}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>

      {!session && showLogin && (
        <form
          onSubmit={handleMagicLink}
          className="mt-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? 'Enviando…' : 'Enviar enlace mágico'}
          </button>
        </form>
      )}

      {status.type !== 'idle' && (
        <p
          className={`mt-3 text-sm ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {status.message}
        </p>
      )}
    </header>
  );
}
