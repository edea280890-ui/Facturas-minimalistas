'use client';

import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { InvoiceDocument } from './InvoiceDocument';
import { invoicePdfFilename } from '@/utils/sanitizeFilename';

export default function InvoicePreview() {
  const { invoice, getSubtotal, getTotal } = useInvoiceStore();

  return (
    <div className="flex h-full min-h-[600px] flex-col gap-3">
      <div className="flex justify-end">
        <PDFDownloadLink
          document={<InvoiceDocument data={invoice} subtotal={getSubtotal()} total={getTotal()} />}
          fileName={invoicePdfFilename(invoice.invoiceNumber)}
          className="text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          {({ loading }) => (loading ? 'Generando PDF…' : 'Descargar PDF')}
        </PDFDownloadLink>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200">
        <PDFViewer className="w-full h-full border-none" showToolbar={true}>
          <InvoiceDocument data={invoice} subtotal={getSubtotal()} total={getTotal()} />
        </PDFViewer>
      </div>
    </div>
  );
}
