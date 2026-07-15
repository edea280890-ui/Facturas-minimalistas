import { create } from 'zustand';
import { Invoice, LineItem, CompanyDetails, ClientDetails } from '@/types/invoice';

interface InvoiceState {
  invoice: Invoice;
  updateCompany: (company: Partial<CompanyDetails>) => void;
  updateClient: (client: Partial<ClientDetails>) => void;
  updateInvoiceDetails: (details: Partial<Omit<Invoice, 'company' | 'client' | 'items'>>) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<LineItem>) => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialState: Invoice = {
  invoiceNumber: 'INV-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date().toISOString().split('T')[0],
  currency: 'USD',
  taxRate: 21,
  company: { name: '', email: '', address: '', taxId: '' },
  client: { name: '', email: '', address: '' },
  items: [{ id: generateId(), description: '', quantity: 1, price: 0 }],
};

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoice: initialState,

  updateCompany: (companyData) =>
    set((state) => ({ invoice: { ...state.invoice, company: { ...state.invoice.company, ...companyData } } })),

  updateClient: (clientData) =>
    set((state) => ({ invoice: { ...state.invoice, client: { ...state.invoice.client, ...clientData } } })),

  updateInvoiceDetails: (details) =>
    set((state) => ({ invoice: { ...state.invoice, ...details } })),

  addItem: () =>
    set((state) => ({
      invoice: {
        ...state.invoice,
        items: [...state.invoice.items, { id: generateId(), description: '', quantity: 1, price: 0 }],
      },
    })),

  removeItem: (id) =>
    set((state) => ({
      invoice: { ...state.invoice, items: state.invoice.items.filter((item) => item.id !== id) },
    })),

  updateItem: (id, itemData) =>
    set((state) => ({
      invoice: {
        ...state.invoice,
        items: state.invoice.items.map((item) => (item.id === id ? { ...item, ...itemData } : item)),
      },
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
}));
