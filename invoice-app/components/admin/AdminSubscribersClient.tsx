'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Subscriber } from '@/utils/subscribers';

interface Props {
  initialSubscribers: Subscriber[];
  initialActiveCount: number;
  initialTotalCount: number;
}

export default function AdminSubscribersClient({
  initialSubscribers,
  initialActiveCount,
  initialTotalCount,
}: Props) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [activeCount, setActiveCount] = useState(initialActiveCount);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [error, setError] = useState<string | null>(null);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  const setStatus = async (email: string, status: 'active' | 'canceled') => {
    setBusyEmail(email);
    setError(null);
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'No se pudo actualizar.');

      setSubscribers((prev) =>
        prev.map((row) => (row.email === email ? { ...row, status } : row)),
      );
      setActiveCount((prev) => prev + (status === 'active' ? 1 : -1));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar.');
    } finally {
      setBusyEmail(null);
    }
  };

  const refresh = async () => {
    setError(null);
    try {
      const res = await fetch('/api/admin/subscribers');
      const json = (await res.json()) as {
        subscribers?: Subscriber[];
        activeCount?: number;
        totalCount?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? 'No se pudo cargar.');
      setSubscribers(json.subscribers ?? []);
      setActiveCount(json.activeCount ?? 0);
      setTotalCount(json.totalCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portero Digital</p>
            <h1 className="text-2xl font-bold text-slate-900">Panel de suscriptores</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Actualizar
            </button>
            <Link
              href="/app"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              ← Volver a la app
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Activos</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total registrados</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Email</th>
                <th className="whitespace-nowrap px-4 py-3">Estado</th>
                <th className="whitespace-nowrap px-4 py-3">Alta</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Aún no hay suscriptores. Llegarán vía el webhook de Hotmart.
                  </td>
                </tr>
              ) : (
                subscribers.map((row) => (
                  <tr key={row.email} className="border-b border-slate-50 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{row.email}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={
                          row.status === 'active'
                            ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700'
                            : 'rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500'
                        }
                      >
                        {row.status === 'active' ? 'Activo' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {new Date(row.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {row.status === 'active' ? (
                        <button
                          type="button"
                          disabled={busyEmail === row.email}
                          onClick={() => void setStatus(row.email, 'canceled')}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {busyEmail === row.email ? '…' : 'Dar de baja'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyEmail === row.email}
                          onClick={() => void setStatus(row.email, 'active')}
                          className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          {busyEmail === row.email ? '…' : 'Reactivar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
