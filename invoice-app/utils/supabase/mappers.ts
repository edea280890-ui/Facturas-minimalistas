import { CompanyDetails, ClientDetails, Invoice, LineItem, StoredInvoice } from '@/types/invoice';

/** Forma cruda de una fila de la tabla `public.invoices` tal como la devuelve PostgREST. */
export interface InvoiceRow {
  id: string;
  user_id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  company: CompanyDetails;
  client: ClientDetails;
  items: LineItem[];
  currency: string;
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

export function rowToStoredInvoice(row: InvoiceRow): StoredInvoice {
  return {
    id: row.id,
    userId: row.user_id,
    invoiceNumber: row.invoice_number,
    date: row.date,
    dueDate: row.due_date,
    company: row.company,
    client: row.client,
    items: row.items,
    currency: row.currency,
    taxEnabled: row.tax_rate > 0,
    taxRate: row.tax_rate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function invoiceToRowPayload(invoice: Invoice, userId: string) {
  return {
    user_id: userId,
    invoice_number: invoice.invoiceNumber,
    date: invoice.date,
    due_date: invoice.dueDate,
    company: invoice.company,
    client: invoice.client,
    items: invoice.items,
    currency: invoice.currency,
    tax_rate: invoice.taxEnabled ? invoice.taxRate : 0,
  };
}
