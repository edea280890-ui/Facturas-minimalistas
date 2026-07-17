import React from 'react';
import Link from 'next/link';
import { SUPPORT_EMAIL } from '@/utils/brand';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/**
 * Layout compartido por las páginas legales públicas (/terms, /privacy, /refund).
 */
export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Volver al inicio
        </Link>

        <article className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Última actualización: {lastUpdated}</p>

          <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-6 text-slate-700 md:text-base">
            {children}
          </div>

          <nav
            aria-label="Documentos legales"
            className="mt-10 flex flex-wrap gap-4 border-t border-slate-100 pt-6 text-sm"
          >
            <Link href="/terms" className="font-medium text-slate-600 hover:text-slate-900">
              Terms
            </Link>
            <Link href="/privacy" className="font-medium text-slate-600 hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/refund" className="font-medium text-slate-600 hover:text-slate-900">
              Refund
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-slate-600 hover:text-slate-900">
              {SUPPORT_EMAIL}
            </a>
          </nav>
        </article>
      </div>
    </main>
  );
}
