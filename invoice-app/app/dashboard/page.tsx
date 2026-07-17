'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RequireAuth from '@/components/auth/RequireAuth';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { StoredInvoice } from '@/types/invoice';
import { computeSubtotal, computeTotal } from '@/utils/invoiceCalculations';

function invoiceTotal(invoice: StoredInvoice): number {
  const subtotal = computeSubtotal(invoice.items);
  const taxEnabled = invoice.taxRate > 0;
  return computeTotal(subtotal, taxEnabled, invoice.taxRate);
}

function DashboardContent() {
  const router = useRouter();
  const invoices = useInvoiceStore((s) => s.invoices);
  const isLoadingInvoices = useInvoiceStore((s) => s.isLoadingInvoices);
  const listError = useInvoiceStore((s) => s.listError);
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices);
  const loadInvoice = useInvoiceStore((s) => s.loadInvoice);
  const deleteInvoice = useInvoiceStore((s) => s.deleteInvoice);
  const showToast = useToastStore((s) => s.showToast);

  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleEdit = async (id: string) => {
    setPendingId(id);
    try {
      const result = await loadInvoice(id);
      if (result.error) {
        showToast('error', result.error);
      } else {
        router.push('/app');
      }
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    const confirmed = window.confirm(`¿Eliminar la factura ${invoiceNumber}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setPendingId(id);
    try {
      const result = await deleteInvoice(id);
      if (result.error) {
        showToast('error', result.error);
      } else {
        showToast('success', `Factura ${invoiceNumber} eliminada.`);
      }
    } finally {
      setPendingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis facturas</h1>
            <p className="text-slate-500">Consulta, edita o elimina tus facturas guardadas en la nube.</p>
          </div>
          <Link
            href="/app"
            className="text-sm font-medium px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Volver al editor
          </Link>
        </div>

        {isLoadingInvoices && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
            Cargando facturas...
          </div>
        )}

        {!isLoadingInvoices && listError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{listError}</div>
        )}

        {!isLoadingInvoices && !listError && invoices.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
            Todavía no has guardado ninguna factura en la nube.
          </div>
        )}

        {!isLoadingInvoices && invoices.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nº Factura</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="text-slate-700">
                    <td className="px-4 py-3 font-mono">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">{invoice.client.name || 'Sin nombre'}</td>
                    <td className="px-4 py-3">{invoice.date}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(invoiceTotal(invoice), invoice.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(invoice.id)}
                          disabled={pendingId === invoice.id}
                          className="rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Cargar / Editar
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                          disabled={pendingId === invoice.id}
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
