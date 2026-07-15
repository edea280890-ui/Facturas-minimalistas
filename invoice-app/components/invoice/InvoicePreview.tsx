'use client';

import React, { useEffect, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { InvoiceDocument } from './InvoiceDocument';

export default function InvoicePreview() {
  const { invoice, getSubtotal, getTotal } = useInvoiceStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  if (!isClient) return <div className="h-full min-h-[600px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">Cargando visor...</div>;

  return (
    <div className="h-full min-h-[600px] rounded-xl overflow-hidden border border-slate-200">
      <PDFViewer className="w-full h-full border-none" showToolbar={true}>
        <InvoiceDocument data={invoice} subtotal={getSubtotal()} total={getTotal()} />
      </PDFViewer>
    </div>
  );
}
