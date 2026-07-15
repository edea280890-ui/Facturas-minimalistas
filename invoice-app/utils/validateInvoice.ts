import { CompanyDetails, ClientDetails, Invoice } from '@/types/invoice';

export interface InvoiceValidationErrors {
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  company?: Partial<Record<keyof CompanyDetails, string>>;
  client?: Partial<Record<keyof ClientDetails, string>>;
  items?: Record<string, Partial<Record<'description' | 'quantity' | 'price', string>>>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBlank(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Valida los campos obligatorios de una factura antes de guardarla en la nube.
 * Devuelve un objeto de errores en español; si no hay ninguna clave, la factura es válida.
 */
export function validateInvoice(invoice: Invoice): InvoiceValidationErrors {
  const errors: InvoiceValidationErrors = {};

  if (isBlank(invoice.invoiceNumber)) {
    errors.invoiceNumber = 'El número de factura es obligatorio.';
  }

  if (isBlank(invoice.date)) {
    errors.date = 'La fecha de emisión es obligatoria.';
  }

  if (isBlank(invoice.dueDate)) {
    errors.dueDate = 'La fecha de vencimiento es obligatoria.';
  } else if (!isBlank(invoice.date) && invoice.dueDate < invoice.date) {
    errors.dueDate = 'El vencimiento no puede ser anterior a la fecha de emisión.';
  }

  const companyErrors: Partial<Record<keyof CompanyDetails, string>> = {};
  if (isBlank(invoice.company.name)) {
    companyErrors.name = 'El nombre del emisor es obligatorio.';
  }
  if (isBlank(invoice.company.address)) {
    companyErrors.address = 'La dirección del emisor es obligatoria.';
  }
  if (!isBlank(invoice.company.email) && !EMAIL_REGEX.test(invoice.company.email.trim())) {
    companyErrors.email = 'El correo del emisor no es válido.';
  }
  if (Object.keys(companyErrors).length > 0) {
    errors.company = companyErrors;
  }

  const clientErrors: Partial<Record<keyof ClientDetails, string>> = {};
  if (isBlank(invoice.client.name)) {
    clientErrors.name = 'El nombre del cliente es obligatorio.';
  }
  if (isBlank(invoice.client.address)) {
    clientErrors.address = 'La dirección del cliente es obligatoria.';
  }
  if (isBlank(invoice.client.email)) {
    clientErrors.email = 'El correo del cliente es obligatorio.';
  } else if (!EMAIL_REGEX.test(invoice.client.email.trim())) {
    clientErrors.email = 'El correo del cliente no es válido.';
  }
  if (Object.keys(clientErrors).length > 0) {
    errors.client = clientErrors;
  }

  if (invoice.items.length === 0) {
    errors.items = { _general: { description: 'Añade al menos un concepto a la factura.' } };
  } else {
    const itemErrors: Record<string, Partial<Record<'description' | 'quantity' | 'price', string>>> = {};
    for (const item of invoice.items) {
      const current: Partial<Record<'description' | 'quantity' | 'price', string>> = {};
      if (isBlank(item.description)) {
        current.description = 'La descripción es obligatoria.';
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        current.quantity = 'La cantidad debe ser mayor que 0.';
      }
      if (!Number.isFinite(item.price) || item.price < 0) {
        current.price = 'El precio no puede ser negativo.';
      }
      if (Object.keys(current).length > 0) {
        itemErrors[item.id] = current;
      }
    }
    if (Object.keys(itemErrors).length > 0) {
      errors.items = itemErrors;
    }
  }

  return errors;
}

export function hasValidationErrors(errors: InvoiceValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Aplana los errores en una lista de mensajes legibles, útil para mostrar en un toast. */
export function flattenValidationErrors(errors: InvoiceValidationErrors): string[] {
  const messages: string[] = [];
  if (errors.invoiceNumber) messages.push(errors.invoiceNumber);
  if (errors.date) messages.push(errors.date);
  if (errors.dueDate) messages.push(errors.dueDate);
  if (errors.company) messages.push(...Object.values(errors.company).filter((m): m is string => Boolean(m)));
  if (errors.client) messages.push(...Object.values(errors.client).filter((m): m is string => Boolean(m)));
  if (errors.items) {
    for (const itemError of Object.values(errors.items)) {
      messages.push(...Object.values(itemError).filter((m): m is string => Boolean(m)));
    }
  }
  return messages;
}
