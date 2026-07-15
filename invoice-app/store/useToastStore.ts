import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  showToast: (variant: ToastVariant, message: string) => void;
  dismissToast: (id: string) => void;
}

const TOAST_DURATION_MS = 5000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (variant, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({ toasts: [...state.toasts, { id, variant, message }] }));

    setTimeout(() => {
      get().dismissToast(id);
    }, TOAST_DURATION_MS);
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
