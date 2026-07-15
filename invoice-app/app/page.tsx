'use client';

import dynamic from 'next/dynamic';
import InvoiceForm from '@/components/invoice/InvoiceForm';

const InvoicePreviewDynamic = dynamic(
  () => import('@/components/invoice/InvoicePreview'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Generador de Facturas</h1>
          <p className="text-slate-500">Completar datos y exportar a PDF</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-8">
            <InvoiceForm />
          </section>
          
          <section className="h-[calc(100vh-120px)]">
            <InvoicePreviewDynamic />
          </section>
        </div>
      </div>
    </main>
  );
}
