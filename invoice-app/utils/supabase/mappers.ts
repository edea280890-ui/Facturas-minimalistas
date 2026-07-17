import {
  CompanyDetails,
  ClientDetails,
  Invoice,
  LineItem,
  PaymentDetails,
  StoredInvoice,
  createEmptyPaymentDetails,
} from '@/types/invoice';

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
  payment_details?: PaymentDetails | null;
  created_at: string;
  updated_at: string;
}

function normalizeCompany(raw: Partial<CompanyDetails> | null | undefined): CompanyDetails {
  return {
    name: raw?.name ?? '',
    email: raw?.email ?? '',
    address: raw?.address ?? '',
    taxId: raw?.taxId ?? '',
    logoUrl: raw?.logoUrl,
  };
}

function normalizeClient(raw: Partial<ClientDetails> | null | undefined): ClientDetails {
  return {
    name: raw?.name ?? '',
    email: raw?.email ?? '',
    address: raw?.address ?? '',
    taxId: raw?.taxId ?? '',
  };
}

function normalizePaymentDetails(raw: PaymentDetails | null | undefined): PaymentDetails {
  const empty = createEmptyPaymentDetails();
  if (!raw || typeof raw !== 'object') return empty;
  return {
    bankName: raw.bankName ?? '',
    accountName: raw.accountName ?? '',
    accountNumber: raw.accountNumber ?? '',
    swiftCode: raw.swiftCode ?? '',
    routingNumber: raw.routingNumber ?? '',
    alternativePayment: raw.alternativePayment ?? '',
  };
}

export function rowToStoredInvoice(row: InvoiceRow): StoredInvoice {
  return {
    id: row.id,
    userId: row.user_id,
    invoiceNumber: row.invoice_number,
    date: row.date,
    dueDate: row.due_date,
    company: normalizeCompany(row.company),
    client: normalizeClient(row.client),
    items: row.items ?? [],
    currency: row.currency,
    taxRate: Number.isFinite(row.tax_rate) ? row.tax_rate : 0,
    paymentDetails: normalizePaymentDetails(row.payment_details),
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
    tax_rate: invoice.taxRate,
    payment_details: invoice.paymentDetails,
  };
}
