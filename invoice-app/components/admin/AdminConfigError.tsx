import Link from 'next/link';

interface AdminConfigErrorProps {
  message: string;
  hint?: string;
}

/**
 * Mensaje controlado para `/admin` cuando algo falla en el servidor
 * (típicamente `SUPABASE_SERVICE_ROLE_KEY` ausente en Vercel, o un error de
 * la consulta a `subscribers`). Se usa en vez de dejar que un `throw` rompa
 * el render del Server Component y produzca un 500 sin contexto.
 */
export default function AdminConfigError({ message, hint }: AdminConfigErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
          Panel de Administración
        </p>
        <h1 className="mt-2 text-xl font-bold text-slate-900">No se pudo cargar el panel</h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
        {hint && <p className="mt-3 text-sm text-slate-500">{hint}</p>}
        <Link
          href="/app"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          ← Volver a la app
        </Link>
      </div>
    </main>
  );
}
