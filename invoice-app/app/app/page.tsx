'use client';

import dynamic from 'next/dynamic';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import Header from '@/components/layout/Header';
import PricingSection from '@/components/landing/PricingSection';

const InvoicePreviewDynamic = dynamic(
  () => import('@/components/invoice/InvoicePreview'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
        Cargando visor...
      </div>
    ),
  }
);

/**
 * Aplicación funcional (editor de facturas + login + upgrade a Pro vía Hotmart
 * si `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` está definido, o Stripe como fallback).
 * La página pública de marketing vive en `/` (app/page.tsx); esta ruta es el
 * producto en sí, al que se llega desde los CTA de la landing.
 */
export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        {/*
          Móvil/tablet (< lg): una sola columna, flujo natural de página, sin
          alturas forzadas a 100vh (evita el "doble scroll de pantalla completa").
          Escritorio (lg+): dos columnas lado a lado, cada una con su propio
          scroll interno y la previsualización fija (sticky) para que quede
          siempre visible mientras se completa el formulario.
        */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <section className="lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 lg:pb-8">
            <InvoiceForm />
          </section>

          <section className="lg:sticky lg:top-4 lg:h-[calc(100vh-120px)]">
            <InvoicePreviewDynamic />
          </section>
        </div>

        {/*
          Los banners de planes (Gratis/Pro) se muestran al final de la
          página, después del formulario y la previsualización, para que no
          se sientan invasivos apenas se entra a la app.
        */}
        <PricingSection />
      </div>
    </main>
  );
}
