import { create } from 'zustand';
import { Invoice, LineItem, CompanyDetails, ClientDetails, StoredInvoice, CurrencyCode } from '@/types/invoice';
import { supabase } from '@/utils/supabase/client';
import { InvoiceRow, invoiceToRowPayload, rowToStoredInvoice } from '@/utils/supabase/mappers';
import {
  validateInvoice,
  hasValidationErrors,
  flattenValidationErrors,
  InvoiceValidationErrors,
} from '@/utils/validateInvoice';
import { getDefaultTaxForCurrency } from '@/utils/currencyConfig';
import { computeSubtotal, computeTaxAmount, computeTotal } from '@/utils/invoiceCalculations';

interface SaveResult {
  error: string | null;
  id?: string;
}

interface DeleteResult {
  error: string | null;
}

interface FetchListResult {
  error: string | null;
}

const INVOICE_NUMBER_PATTERN = /^(.*?)(\d+)$/;
const DEFAULT_INVOICE_PREFIX = 'FAC-';
const DEFAULT_INVOICE_PADDING = 4;

/** Borrador del email del cliente; mutación sin set() para no re-renderizar suscriptores. */
let draftClientEmail: string | undefined;
/** Borrador del porcentaje de impuesto mientras el usuario escribe. */
let draftTaxRate: number | undefined;

interface InvoiceState {
  invoice: Invoice;
  currentInvoiceId: string | null;
  invoices: StoredInvoice[];
  isLoadingInvoices: boolean;
  listError: string | null;
  validationErrors: InvoiceValidationErrors;

  updateCompany: (company: Partial<CompanyDetails>) => void;
  updateClient: (client: Partial<ClientDetails>) => void;
  setDraftClientEmail: (email: string) => void;
  setDraftTaxRate: (rate: number) => void;
  flushDraftFields: () => void;
  setCurrency: (currency: CurrencyCode) => void;
  setTaxEnabled: (enabled: boolean) => void;
  updateInvoiceDetails: (details: Partial<Omit<Invoice, 'company' | 'client' | 'items'>>) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<LineItem>) => void;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;

  newInvoice: () => void;
  saveInvoiceToCloud: () => Promise<SaveResult>;
  updateInvoiceInCloud: (id: string) => Promise<SaveResult>;
  fetchInvoices: () => Promise<FetchListResult>;
  loadInvoice: (id: string) => Promise<SaveResult>;
  deleteInvoice: (id: string) => Promise<DeleteResult>;
  generateNextInvoiceNumber: () => Promise<string | null>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

function buildInitialInvoice(): Invoice {
  const currency: CurrencyCode = 'USD';
  const { taxEnabled, taxRate } = getDefaultTaxForCurrency(currency);
  return {
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    currency,
    taxEnabled,
    taxRate,
    company: { name: '', email: '', address: '', taxId: '' },
    client: { name: '', email: '', address: '' },
    items: [{ id: generateId(), description: '', quantity: 1, price: 0 }],
  };
}

function effectiveTaxRate(invoice: Invoice): number {
  if (draftTaxRate !== undefined && invoice.taxEnabled) {
    return draftTaxRate;
  }
  return invoice.taxEnabled ? invoice.taxRate : 0;
}

function nextInvoiceNumberFrom(lastNumber: string | null): string {
  if (!lastNumber) {
    return `${DEFAULT_INVOICE_PREFIX}${'1'.padStart(DEFAULT_INVOICE_PADDING, '0')}`;
  }

  const match = lastNumber.match(INVOICE_NUMBER_PATTERN);
  if (!match) {
    return `${DEFAULT_INVOICE_PREFIX}${'1'.padStart(DEFAULT_INVOICE_PADDING, '0')}`;
  }

  const [, prefix, digits] = match;
  const nextValue = (parseInt(digits, 10) + 1).toString().padStart(digits.length, '0');
  return `${prefix}${nextValue}`;
}

async function getAuthenticatedUserId(): Promise<{ userId: string | null; error: string | null }> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) return { userId: null, error: error.message };
  if (!session?.user) {
    return { userId: null, error: 'Debes iniciar sesión para continuar.' };
  }
  return { userId: session.user.id, error: null };
}

function describeError(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoice: buildInitialInvoice(),
  currentInvoiceId: null,
  invoices: [],
  isLoadingInvoices: false,
  listError: null,
  validationErrors: {},

  updateCompany: (companyData) =>
    set((state) => ({
      invoice: { ...state.invoice, company: { ...state.invoice.company, ...companyData } },
      validationErrors: {},
    })),

  setDraftClientEmail: (email) => {
    draftClientEmail = email;
  },

  setDraftTaxRate: (rate) => {
    draftTaxRate = rate;
  },

  flushDraftFields: () => {
    const updates: Partial<Invoice> = {};
    let shouldUpdate = false;

    if (draftClientEmail !== undefined) {
      const committedEmail = draftClientEmail;
      draftClientEmail = undefined;
      if (committedEmail !== get().invoice.client.email) {
        updates.client = { ...get().invoice.client, email: committedEmail };
        shouldUpdate = true;
      }
    }

    if (draftTaxRate !== undefined) {
      const committedRate = draftTaxRate;
      draftTaxRate = undefined;
      if (committedRate !== get().invoice.taxRate) {
        updates.taxRate = committedRate;
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      set((state) => ({
        invoice: { ...state.invoice, ...updates },
        validationErrors: {},
      }));
    }
  },

  setCurrency: (currency) => {
    draftTaxRate = undefined;
    const defaults = getDefaultTaxForCurrency(currency);
    set((state) => ({
      invoice: {
        ...state.invoice,
        currency,
        taxEnabled: defaults.taxEnabled,
        taxRate: defaults.taxRate,
      },
      validationErrors: {},
    }));
  },

  setTaxEnabled: (enabled) => {
    draftTaxRate = undefined;
    set((state) => {
      const suggested = getDefaultTaxForCurrency(state.invoice.currency).taxRate;
      return {
        invoice: {
          ...state.invoice,
          taxEnabled: enabled,
          taxRate: enabled ? (state.invoice.taxRate > 0 ? state.invoice.taxRate : suggested) : 0,
        },
        validationErrors: {},
      };
    });
  },

  updateClient: (clientData) => {
    if ('email' in clientData) {
      draftClientEmail = undefined;
    }
    set((state) => ({
      invoice: { ...state.invoice, client: { ...state.invoice.client, ...clientData } },
      validationErrors: {},
    }));
  },

  updateInvoiceDetails: (details) => {
    if ('taxRate' in details) {
      draftTaxRate = undefined;
    }
    set((state) => ({ invoice: { ...state.invoice, ...details }, validationErrors: {} }));
  },

  addItem: () =>
    set((state) => ({
      invoice: {
        ...state.invoice,
        items: [...state.invoice.items, { id: generateId(), description: '', quantity: 1, price: 0 }],
      },
      validationErrors: {},
    })),

  removeItem: (id) =>
    set((state) => ({
      invoice: { ...state.invoice, items: state.invoice.items.filter((item) => item.id !== id) },
      validationErrors: {},
    })),

  updateItem: (id, itemData) =>
    set((state) => ({
      invoice: {
        ...state.invoice,
        items: state.invoice.items.map((item) => (item.id === id ? { ...item, ...itemData } : item)),
      },
      validationErrors: {},
    })),

  getSubtotal: () => computeSubtotal(get().invoice.items),

  getTaxAmount: () => {
    const invoice = get().invoice;
    return computeTaxAmount(get().getSubtotal(), invoice.taxEnabled, effectiveTaxRate(invoice));
  },

  getTotal: () => {
    const invoice = get().invoice;
    const subtotal = get().getSubtotal();
    return computeTotal(subtotal, invoice.taxEnabled, effectiveTaxRate(invoice));
  },

  newInvoice: () => {
    draftClientEmail = undefined;
    draftTaxRate = undefined;
    set({ invoice: buildInitialInvoice(), currentInvoiceId: null, validationErrors: {} });
  },

  saveInvoiceToCloud: async (): Promise<SaveResult> => {
    try {
      get().flushDraftFields();
      const { invoice } = get();
      const validationErrors = validateInvoice(invoice);
      if (hasValidationErrors(validationErrors)) {
        set({ validationErrors });
        return { error: flattenValidationErrors(validationErrors).join(' ') };
      }

      const { userId, error: authError } = await getAuthenticatedUserId();
      if (authError || !userId) {
        return { error: authError ?? 'Debes iniciar sesión para guardar la factura en la nube.' };
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceToRowPayload(invoice, userId))
        .select('id')
        .single();

      if (error) throw error;

      set({ currentInvoiceId: data.id as string, validationErrors: {} });
      return { error: null, id: data.id as string };
    } catch (err) {
      return { error: describeError(err, 'Ocurrió un error desconocido al guardar la factura.') };
    }
  },

  updateInvoiceInCloud: async (id: string): Promise<SaveResult> => {
    try {
      get().flushDraftFields();
      const { invoice } = get();
      const validationErrors = validateInvoice(invoice);
      if (hasValidationErrors(validationErrors)) {
        set({ validationErrors });
        return { error: flattenValidationErrors(validationErrors).join(' ') };
      }

      const { userId, error: authError } = await getAuthenticatedUserId();
      if (authError || !userId) {
        return { error: authError ?? 'Debes iniciar sesión para actualizar la factura.' };
      }

      const { error } = await supabase
        .from('invoices')
        .update(invoiceToRowPayload(invoice, userId))
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      set({ validationErrors: {} });
      return { error: null, id };
    } catch (err) {
      return { error: describeError(err, 'Ocurrió un error desconocido al actualizar la factura.') };
    }
  },

  fetchInvoices: async (): Promise<FetchListResult> => {
    set({ isLoadingInvoices: true, listError: null });
    try {
      const { userId, error: authError } = await getAuthenticatedUserId();
      if (authError || !userId) {
        const message = authError ?? 'Debes iniciar sesión para ver tus facturas.';
        set({ isLoadingInvoices: false, listError: message });
        return { error: message };
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const invoices = ((data ?? []) as InvoiceRow[]).map(rowToStoredInvoice);
      set({ invoices, isLoadingInvoices: false, listError: null });
      return { error: null };
    } catch (err) {
      const message = describeError(err, 'No se pudieron cargar tus facturas.');
      set({ isLoadingInvoices: false, listError: message });
      return { error: message };
    }
  },

  loadInvoice: async (id: string): Promise<SaveResult> => {
    try {
      const { userId, error: authError } = await getAuthenticatedUserId();
      if (authError || !userId) {
        return { error: authError ?? 'Debes iniciar sesión para cargar la factura.' };
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const stored = rowToStoredInvoice(data as InvoiceRow);
      const invoiceFields: Invoice = {
        invoiceNumber: stored.invoiceNumber,
        date: stored.date,
        dueDate: stored.dueDate,
        company: stored.company,
        client: stored.client,
        items: stored.items,
        currency: stored.currency,
        taxEnabled: stored.taxRate > 0,
        taxRate: stored.taxRate,
      };

      draftClientEmail = undefined;
      draftTaxRate = undefined;
      set({ invoice: invoiceFields, currentInvoiceId: stored.id, validationErrors: {} });
      return { error: null, id: stored.id };
    } catch (err) {
      return { error: describeError(err, 'No se pudo cargar la factura seleccionada.') };
    }
  },

  deleteInvoice: async (id: string): Promise<DeleteResult> => {
    try {
      const { userId, error: authError } = await getAuthenticatedUserId();
      if (authError || !userId) {
        return { error: authError ?? 'Debes iniciar sesión para eliminar la factura.' };
      }

      const { error } = await supabase.from('invoices').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;

      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
        currentInvoiceId: state.currentInvoiceId === id ? null : state.currentInvoiceId,
      }));
      return { error: null };
    } catch (err) {
      return { error: describeError(err, 'No se pudo eliminar la factura.') };
    }
  },

  generateNextInvoiceNumber: async (): Promise<string | null> => {
    try {
      const { userId, error: authError } = await getAuthenticatedUserId();
      if (authError || !userId) return null;

      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const lastNumber = (data as { invoice_number: string } | null)?.invoice_number ?? null;
      const nextNumber = nextInvoiceNumberFrom(lastNumber);
      set((state) => ({ invoice: { ...state.invoice, invoiceNumber: nextNumber } }));
      return nextNumber;
    } catch {
      return null;
    }
  },
}));
