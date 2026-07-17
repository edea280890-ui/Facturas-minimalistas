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
  /** Identificador fiscal internacional genérico (VAT / EIN / Tax ID / etc.). */
  taxId: string;
  /** URL pública del logo del emisor, subido a Supabase Storage (bucket `logos`). */
  logoUrl?: string;
}

export interface ClientDetails {
  name: string;
  email: string;
  address: string;
  /** Identificador fiscal internacional genérico del cliente (VAT / Tax ID / etc.). */
  taxId: string;
}

/**
 * Datos bancarios / de cobro para Commercial Invoices B2B.
 * Todos los campos son opcionales; el exportador completa lo que aplique.
 */
export interface PaymentDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftCode?: string;
  routingNumber?: string;
  /** Método alternativo (Wise, Payoneer, etc.). */
  alternativePayment?: string;
}

export interface Invoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: CompanyDetails;
  client: ClientDetails;
  items: LineItem[];
  currency: string;
  /**
   * Porcentaje de impuesto/descuento aplicado sobre el subtotal.
   * Inicia en 0; sin matrices por país ni toggles locales.
   */
  taxRate: number;
  paymentDetails: PaymentDetails;
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

export function createEmptyPaymentDetails(): PaymentDetails {
  return {
    bankName: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
    routingNumber: '',
    alternativePayment: '',
  };
}
