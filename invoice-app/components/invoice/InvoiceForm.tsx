'use client';

import React, { useState } from 'react';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { SUPPORTED_CURRENCIES } from '@/types/invoice';
import { uploadCompanyLogo } from '@/utils/supabase/storage';

export default function InvoiceForm() {
  const {
    invoice, updateCompany, updateClient, updateInvoiceDetails,
    addItem, removeItem, updateItem, getSubtotal, getTotal,
    validationErrors, generateNextInvoiceNumber,
  } = useInvoiceStore();
  const session = useAuthStore((s) => s.session);
  const showToast = useToastStore((s) => s.showToast);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'price', value: string) => {
    if (field === 'description') updateItem(id, { description: value });
    else updateItem(id, { [field]: parseFloat(value) || 0 });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!session) {
      showToast('error', 'Inicia sesión para subir el logo de tu empresa.');
      return;
    }

    setUploadingLogo(true);
    try {
      const result = await uploadCompanyLogo(file, session.user.id);
      if (result.error || !result.url) {
        showToast('error', result.error ?? 'No se pudo subir el logo.');
      } else {
        updateCompany({ logoUrl: result.url });
        showToast('success', 'Logo subido correctamente.');
      }
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAutoNumber = async () => {
    if (!session) {
      showToast('error', 'Inicia sesión para generar un número de factura secuencial.');
      return;
    }
    const nextNumber = await generateNextInvoiceNumber();
    if (!nextNumber) {
      showToast('error', 'No se pudo generar el número de factura automáticamente.');
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 transition-colors focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none";
  const errorInputClass = "border-red-300 focus:border-red-400 focus:ring-red-100";
  const labelClass = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
  const cardClass = "bg-white p-6 rounded-xl border border-slate-200 shadow-sm";
  const errorTextClass = "mt-1 text-xs text-red-600";

  const itemErrors = validationErrors.items ?? {};

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={labelClass}>Nº Factura</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={invoice.invoiceNumber}
                onChange={(e) => updateInvoiceDetails({ invoiceNumber: e.target.value })}
                className={`${inputClass} font-mono ${validationErrors.invoiceNumber ? errorInputClass : ''}`}
              />
              <button
                type="button"
                onClick={handleAutoNumber}
                title="Generar número secuencial automático"
                className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Auto
              </button>
            </div>
            {validationErrors.invoiceNumber && <p className={errorTextClass}>{validationErrors.invoiceNumber}</p>}
          </div>
          <div className="flex-1">
            <label className={labelClass}>Fecha Emisión</label>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => updateInvoiceDetails({ date: e.target.value })}
              className={`${inputClass} ${validationErrors.date ? errorInputClass : ''}`}
            />
            {validationErrors.date && <p className={errorTextClass}>{validationErrors.date}</p>}
          </div>
          <div className="flex-1">
            <label className={labelClass}>Vencimiento</label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => updateInvoiceDetails({ dueDate: e.target.value })}
              className={`${inputClass} ${validationErrors.dueDate ? errorInputClass : ''}`}
            />
            {validationErrors.dueDate && <p className={errorTextClass}>{validationErrors.dueDate}</p>}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={cardClass}>
          <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Emisor</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Empresa / Nombre</label>
              <input
                type="text"
                value={invoice.company.name}
                onChange={(e) => updateCompany({ name: e.target.value })}
                className={`${inputClass} ${validationErrors.company?.name ? errorInputClass : ''}`}
              />
              {validationErrors.company?.name && <p className={errorTextClass}>{validationErrors.company.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Correo</label>
              <input
                type="email"
                value={invoice.company.email}
                onChange={(e) => updateCompany({ email: e.target.value })}
                className={`${inputClass} ${validationErrors.company?.email ? errorInputClass : ''}`}
              />
              {validationErrors.company?.email && <p className={errorTextClass}>{validationErrors.company.email}</p>}
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <input
                type="text"
                value={invoice.company.address}
                onChange={(e) => updateCompany({ address: e.target.value })}
                className={`${inputClass} ${validationErrors.company?.address ? errorInputClass : ''}`}
              />
              {validationErrors.company?.address && <p className={errorTextClass}>{validationErrors.company.address}</p>}
            </div>
            <div>
              <label className={labelClass}>ID Fiscal</label>
              <input type="text" value={invoice.company.taxId} onChange={(e) => updateCompany({ taxId: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Logo (opcional)</label>
              <div className="flex items-center gap-3">
                {invoice.company.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- URL externa de Supabase Storage, no requiere optimización de next/image.
                  <img
                    src={invoice.company.logoUrl}
                    alt="Logo del emisor"
                    className="h-10 w-10 rounded-md border border-slate-200 object-contain bg-white"
                  />
                )}
                <label className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer">
                  {uploadingLogo ? 'Subiendo…' : invoice.company.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoChange}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Cliente</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Empresa / Cliente</label>
              <input
                type="text"
                value={invoice.client.name}
                onChange={(e) => updateClient({ name: e.target.value })}
                className={`${inputClass} ${validationErrors.client?.name ? errorInputClass : ''}`}
              />
              {validationErrors.client?.name && <p className={errorTextClass}>{validationErrors.client.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Correo Electrónico</label>
              <input
                type="email"
                value={invoice.client.email}
                onChange={(e) => updateClient({ email: e.target.value })}
                className={`${inputClass} ${validationErrors.client?.email ? errorInputClass : ''}`}
              />
              {validationErrors.client?.email && <p className={errorTextClass}>{validationErrors.client.email}</p>}
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <input
                type="text"
                value={invoice.client.address}
                onChange={(e) => updateClient({ address: e.target.value })}
                className={`${inputClass} ${validationErrors.client?.address ? errorInputClass : ''}`}
              />
              {validationErrors.client?.address && <p className={errorTextClass}>{validationErrors.client.address}</p>}
            </div>
          </div>
        </section>
      </div>

      <section className={cardClass}>
        <div className="flex justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Conceptos</h3>
          <button onClick={addItem} className="text-xs font-medium px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">+ Añadir</button>
        </div>
        <div className="space-y-3">
          {invoice.items.map((item) => {
            const currentItemErrors = itemErrors[item.id];
            return (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className={`${inputClass} flex-[3] ${currentItemErrors?.description ? errorInputClass : ''}`}
                    placeholder="Descripción"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    className={`${inputClass} flex-1 text-right font-mono ${currentItemErrors?.quantity ? errorInputClass : ''}`}
                    placeholder="Cant."
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                    className={`${inputClass} flex-[1.5] text-right font-mono ${currentItemErrors?.price ? errorInputClass : ''}`}
                    placeholder="Precio"
                  />
                  <button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30">
                    ✕
                  </button>
                </div>
                {(currentItemErrors?.description || currentItemErrors?.quantity || currentItemErrors?.price) && (
                  <p className={errorTextClass}>
                    {[currentItemErrors?.description, currentItemErrors?.quantity, currentItemErrors?.price]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex gap-4 w-full sm:w-1/2">
          <div className="flex-1">
            <label className={labelClass}>Divisa</label>
            <select value={invoice.currency} onChange={(e) => updateInvoiceDetails({ currency: e.target.value })} className={inputClass}>
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Impuesto (%)</label>
            <input
              type="number"
              min="0"
              value={invoice.taxRate}
              onChange={(e) => updateInvoiceDetails({ taxRate: parseFloat(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="w-full sm:w-80 bg-slate-900 text-white p-6 rounded-xl">
          <div className="flex justify-between text-slate-300 mb-2"><span>Subtotal</span><span>{formatCurrency(getSubtotal(), invoice.currency)}</span></div>
          <div className="flex justify-between text-slate-300 mb-4"><span>Impuestos</span><span>{formatCurrency(getTotal() - getSubtotal(), invoice.currency)}</span></div>
          <div className="flex justify-between text-lg font-bold border-t border-slate-700 pt-4"><span>Total</span><span>{formatCurrency(getTotal(), invoice.currency)}</span></div>
        </div>
      </section>
    </div>
  );
}
