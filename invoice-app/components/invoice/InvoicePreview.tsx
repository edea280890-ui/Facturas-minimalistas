'use client';

import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { InvoiceDocument } from './InvoiceDocument';
import { invoicePdfFilename } from '@/utils/sanitizeFilename';

/**
 * Por debajo de este ancho tratamos el dispositivo como "móvil" para efectos
 * del visor de PDF (no del resto del layout, que ya es fluido con Tailwind).
 * Coincide con el breakpoint `md` de Tailwind (768px).
 */
const MOBILE_VIEWER_QUERY = '(max-width: 767px)';

const downloadButtonClass =
  'whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800';

export default function InvoicePreview() {
  const { invoice, getSubtotal, getTaxAmount, getTotal } = useInvoiceStore();
  // El <PDFViewer> de @react-pdf/renderer incrusta el visor de PDF nativo del
  // navegador en un iframe. En navegadores de escritorio funciona bien, pero
  // en móviles es conocido por no ser fiable: Android normalmente no lo
  // renderiza (o muestra un botón "Abrir" que no hace nada) y iOS Safari solo
  // muestra la primera página sin poder hacer scroll. Mostrar ese visor roto
  // no cumpliría con "todos los elementos... funcionales en cualquier
  // resolución", así que en móvil lo sustituimos por una alternativa
  // funcional apoyada en el botón de descarga (que sí funciona en todos los
  // dispositivos, al ser una descarga de blob normal).
  const isMobileViewer = useMediaQuery(MOBILE_VIEWER_QUERY);

  const document = (
    <InvoiceDocument
      data={invoice}
      subtotal={getSubtotal()}
      taxAmount={getTaxAmount()}
      total={getTotal()}
    />
  );
  const fileName = invoicePdfFilename(invoice.invoiceNumber);

  return (
    <div className="flex h-full min-h-[420px] w-full max-w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-700 sm:text-base">Previsualización</h2>
        <PDFDownloadLink document={document} fileName={fileName} className={downloadButtonClass}>
          {({ loading }) => (loading ? 'Generando PDF…' : 'Descargar PDF')}
        </PDFDownloadLink>
      </div>

      {isMobileViewer ? (
        <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <span className="text-3xl" aria-hidden="true">
            📄
          </span>
          <p className="max-w-xs text-sm text-slate-600">
            La vista previa interactiva no es compatible con este dispositivo. Usa el botón{' '}
            <strong>&quot;Descargar PDF&quot;</strong> de arriba para ver tu factura completa.
          </p>
        </div>
      ) : (
        <div className="min-h-[480px] flex-1 overflow-hidden rounded-xl border border-slate-200">
          <PDFViewer className="h-full w-full border-none" showToolbar>
            {document}
          </PDFViewer>
        </div>
      )}
    </div>
  );
}
