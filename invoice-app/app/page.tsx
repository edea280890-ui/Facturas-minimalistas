'use client';

import dynamic from 'next/dynamic';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import Header from '@/components/layout/Header';

const InvoicePreviewDynamic = dynamic(
  () => import('@/components/invoice/InvoicePreview'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[600px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
        Cargando visor...
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

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
