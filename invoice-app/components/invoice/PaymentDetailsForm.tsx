'use client';

import { PaymentDetails } from '@/types/invoice';
import { DeferredInput } from './DeferredInput';

interface PaymentDetailsFormProps {
  paymentDetails: PaymentDetails;
  onCommitField: (field: keyof PaymentDetails, value: string) => void;
  onDraftField?: (field: keyof PaymentDetails, value: string) => void;
  inputClass: string;
  labelClass: string;
  cardClass: string;
}

const PAYMENT_FIELDS: Array<{
  key: keyof PaymentDetails;
  label: string;
  placeholder?: string;
  autoComplete?: string;
}> = [
  { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. Chase, HSBC', autoComplete: 'organization' },
  { key: 'accountName', label: 'Account Holder', placeholder: 'Name on the account', autoComplete: 'name' },
  { key: 'accountNumber', label: 'Account Number / IBAN', placeholder: 'IBAN or account number', autoComplete: 'off' },
  { key: 'swiftCode', label: 'SWIFT / BIC', placeholder: 'e.g. CHASUS33', autoComplete: 'off' },
  { key: 'routingNumber', label: 'Routing Number', placeholder: 'ABA / routing (optional)', autoComplete: 'off' },
  {
    key: 'alternativePayment',
    label: 'Alternative Method',
    placeholder: 'Wise / Payoneer / etc.',
    autoComplete: 'off',
  },
];

/**
 * Formulario de datos de cobro internacional.
 * Todos los inputs usan DeferredInput: el store solo se actualiza en blur,
 * evitando re-renders del PDF durante la escritura (INP).
 */
export function PaymentDetailsForm({
  paymentDetails,
  onCommitField,
  onDraftField,
  inputClass,
  labelClass,
  cardClass,
}: PaymentDetailsFormProps) {
  return (
    <section className={cardClass}>
      <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold text-slate-800">
        Payment Details
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PAYMENT_FIELDS.map(({ key, label, placeholder, autoComplete }) => (
          <DeferredInput
            key={key}
            id={`payment-${key}`}
            label={label}
            value={paymentDetails[key] ?? ''}
            onDraftChange={onDraftField ? (value) => onDraftField(key, value) : undefined}
            onCommit={(value) => onCommitField(key, value)}
            inputClass={inputClass}
            labelClass={labelClass}
            placeholder={placeholder}
            autoComplete={autoComplete}
          />
        ))}
      </div>
    </section>
  );
}
