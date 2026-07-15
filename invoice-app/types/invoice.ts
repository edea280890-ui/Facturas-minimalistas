export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CompanyDetails {
  name: string;
  email: string;
  address: string;
  taxId: string;
}

export interface ClientDetails {
  name: string;
  email: string;
  address: string;
}

export interface Invoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: CompanyDetails;
  client: ClientDetails;
  items: LineItem[];
  currency: string;
  taxRate: number;
}

/** Factura tal como se almacena en Supabase (incluye metadatos de la fila). */
export interface StoredInvoice extends Invoice {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** Divisas soportadas por el generador, usadas para el formato con Intl.NumberFormat. */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN', 'ARS', 'COP', 'CLP', 'PEN'] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];
