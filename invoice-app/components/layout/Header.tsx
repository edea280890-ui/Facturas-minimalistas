'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useToastStore } from '@/store/useToastStore';

export default function Header() {
  const session = useAuthStore((s) => s.session);
  const initialize = useAuthStore((s) => s.initialize);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentInvoiceId = useInvoiceStore((s) => s.currentInvoiceId);
  const saveInvoiceToCloud = useInvoiceStore((s) => s.saveInvoiceToCloud);
  const updateInvoiceInCloud = useInvoiceStore((s) => s.updateInvoiceInCloud);
  const newInvoice = useInvoiceStore((s) => s.newInvoice);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (error) throw error;
      showToast('success', 'Enlace enviado. Revisa tu correo para iniciar sesión.');
      setEmail('');
      setShowLogin(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo enviar el enlace de acceso.';
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      newInvoice();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cerrar la sesión.';
      showToast('error', message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = currentInvoiceId
        ? await updateInvoiceInCloud(currentInvoiceId)
        : await saveInvoiceToCloud();

      if (result.error) {
        showToast('error', result.error);
      } else {
        showToast(
          'success',
          currentInvoiceId
            ? `Factura ${result.id} actualizada correctamente.`
            : `Factura guardada correctamente (id: ${result.id}).`,
        );
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

        <div className="flex flex-wrap items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">{session.user.email}</span>
              <Link href="/dashboard" className={btnGhost}>
                Mis facturas
              </Link>
              <button onClick={newInvoice} className={btnGhost}>
                Nueva factura
              </button>
              <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving
                  ? 'Guardando…'
                  : currentInvoiceId
                    ? 'Guardar cambios'
                    : 'Guardar en la nube'}
              </button>
              <button onClick={handleSignOut} className={btnGhost}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span
                title="Inicia sesión para guardar tus facturas en la nube"
                className="text-sm text-slate-400"
              >
                Inicia sesión para guardar en la nube
              </span>
              <button onClick={() => setShowLogin((v) => !v)} className={btnPrimary}>
                Iniciar Sesión
              </button>
            </div>
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
    </header>
  );
}
