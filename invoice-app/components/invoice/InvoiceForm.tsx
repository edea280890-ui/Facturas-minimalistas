'use client';

import React from 'react';
import { useInvoiceStore } from '@/store/useInvoiceStore';

export default function InvoiceForm() {
  const {
    invoice, updateCompany, updateClient, updateInvoiceDetails,
    addItem, removeItem, updateItem, getSubtotal, getTotal,
  } = useInvoiceStore();

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'price', value: string) => {
    if (field === 'description') updateItem(id, { description: value });
    else updateItem(id, { [field]: parseFloat(value) || 0 });
  };

  const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 transition-colors focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none";
  const labelClass = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
  const cardClass = "bg-white p-6 rounded-xl border border-slate-200 shadow-sm";

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={labelClass}>Nº Factura</label>
            <input type="text" value={invoice.invoiceNumber} onChange={(e) => updateInvoiceDetails({ invoiceNumber: e.target.value })} className={`${inputClass} font-mono`} />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Fecha Emisión</label>
            <input type="date" value={invoice.date} onChange={(e) => updateInvoiceDetails({ date: e.target.value })} className={inputClass} />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Vencimiento</label>
            <input type="date" value={invoice.dueDate} onChange={(e) => updateInvoiceDetails({ dueDate: e.target.value })} className={inputClass} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={cardClass}>
          <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Emisor</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Empresa / Nombre</label>
              <input type="text" value={invoice.company.name} onChange={(e) => updateCompany({ name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <input type="text" value={invoice.company.address} onChange={(e) => updateCompany({ address: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>ID Fiscal</label>
              <input type="text" value={invoice.company.taxId} onChange={(e) => updateCompany({ taxId: e.target.value })} className={inputClass} />
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Cliente</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Empresa / Cliente</label>
              <input type="text" value={invoice.client.name} onChange={(e) => updateClient({ name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Correo Electrónico</label>
              <input type="email" value={invoice.client.email} onChange={(e) => updateClient({ email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <input type="text" value={invoice.client.address} onChange={(e) => updateClient({ address: e.target.value })} className={inputClass} />
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
          {invoice.items.map((item) => (
            <div key={item.id} className="flex gap-2 items-center">
              <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className={`${inputClass} flex-[3]`} placeholder="Descripción" />
              <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className={`${inputClass} flex-1 text-right font-mono`} placeholder="Cant." />
              <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className={`${inputClass} flex-[1.5] text-right font-mono`} placeholder="Precio" />
              <button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30">
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex gap-4 w-full sm:w-1/2">
          <div className="flex-1">
            <label className={labelClass}>Divisa</label>
            <select value={invoice.currency} onChange={(e) => updateInvoiceDetails({ currency: e.target.value })} className={inputClass}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Impuesto (%)</label>
            <input type="number" value={invoice.taxRate} onChange={(e) => updateInvoiceDetails({ taxRate: parseFloat(e.target.value) || 0 })} className={inputClass} />
          </div>
        </div>
        <div className="w-full sm:w-80 bg-slate-900 text-white p-6 rounded-xl">
          <div className="flex justify-between text-slate-300 mb-2"><span>Subtotal</span><span>{getSubtotal().toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-300 mb-4"><span>Impuestos</span><span>{(getTotal() - getSubtotal()).toFixed(2)}</span></div>
          <div className="flex justify-between text-lg font-bold border-t border-slate-700 pt-4"><span>Total</span><span>{invoice.currency} {getTotal().toFixed(2)}</span></div>
        </div>
      </section>
    </div>
  );
}
