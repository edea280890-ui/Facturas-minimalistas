/**
 * Forma (parcial y defensiva) del payload que envía Hotmart en sus webhooks.
 * Hotmart ha tenido más de un formato a lo largo de sus distintas versiones de
 * API, así que todos los campos son opcionales y el código que los consume
 * debe tolerar que falten. Ajustar esta forma en cuanto se reciba un payload
 * real de producción.
 */
export interface HotmartWebhookPayload {
  /** Token de seguridad, en algunas configuraciones viaja dentro del body. */
  hottok?: string;
  /** Ej: "PURCHASE_APPROVED", "PURCHASE_COMPLETE", "PURCHASE_CANCELED", etc. */
  event?: string;
  data?: {
    buyer?: {
      email?: string;
      name?: string;
    };
    subscriber?: {
      email?: string;
    };
    purchase?: {
      /** Ej: "APPROVED", "COMPLETE"/"COMPLETED", "CANCELLED", "REFUNDED". */
      status?: string;
      transaction?: string;
      price?: {
        value?: number;
        currency_value?: string;
      };
    };
    subscription?: {
      status?: string;
      subscriber?: {
        code?: string;
      };
    };
    product?: {
      id?: number | string;
      name?: string;
    };
  };
  /** Algunos formatos antiguos de Hotmart envían estos campos "planos" en la raíz. */
  email?: string;
  status?: string;
}

/** Estados de compra de Hotmart que consideramos "pago aprobado". */
export const HOTMART_APPROVED_STATUSES = ['APPROVED', 'COMPLETE', 'COMPLETED'];
