import { create } from 'zustand';
import { Invoice, LineItem, CompanyDetails, ClientDetails, StoredInvoice } from '@/types/invoice';
import { supabase } from '@/utils/supabase/client';
import { InvoiceRow, invoiceToRowPayload, rowToStoredInvoice } from '@/utils/supabase/mappers';
import {
  validateInvoice,
  hasValidationErrors,
  flattenValidationErrors,
  InvoiceValidationErrors,
} from '@/utils/validateInvoice';

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

interface InvoiceState {
  invoice: Invoice;
  currentInvoiceId: string | null;
  invoices: StoredInvoice[];
  isLoadingInvoices: boolean;
  listError: string | null;
  validationErrors: InvoiceValidationErrors;

  updateCompany: (company: Partial<CompanyDetails>) => void;
  updateClient: (client: Partial<ClientDetails>) => void;
  updateInvoiceDetails: (details: Partial<Omit<Invoice, 'company' | 'client' | 'items'>>) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<LineItem>) => void;
  getSubtotal: () => number;
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
  return {
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    currency: 'USD',
    taxRate: 21,
    company: { name: '', email: '', address: '', taxId: '' },
    client: { name: '', email: '', address: '' },
    items: [{ id: generateId(), description: '', quantity: 1, price: 0 }],
  };
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

  updateClient: (clientData) =>
    set((state) => ({
      invoice: { ...state.invoice, client: { ...state.invoice.client, ...clientData } },
      validationErrors: {},
    })),

  updateInvoiceDetails: (details) =>
    set((state) => ({ invoice: { ...state.invoice, ...details }, validationErrors: {} })),

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

  getSubtotal: () => {
    const items = get().invoice.items;
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const taxRate = get().invoice.taxRate;
    return subtotal + subtotal * (taxRate / 100);
  },

  newInvoice: () => {
    set({ invoice: buildInitialInvoice(), currentInvoiceId: null, validationErrors: {} });
  },

  saveInvoiceToCloud: async (): Promise<SaveResult> => {
    try {
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
        taxRate: stored.taxRate,
      };

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
