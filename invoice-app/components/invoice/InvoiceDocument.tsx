import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice, PaymentDetails } from '@/types/invoice';
import { formatCurrency } from '@/utils/formatCurrency';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  meta: {
    marginBottom: 2,
    color: '#475569',
  },
  parties: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  partyColumn: {
    width: '48%',
  },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 6,
    color: '#64748b',
    letterSpacing: 0.8,
  },
  partyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#0f172a',
    marginBottom: 3,
  },
  text: {
    marginBottom: 2,
    color: '#334155',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '42%',
    paddingVertical: 4,
  },
  finalTotal: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 6,
    marginTop: 4,
    color: '#0f172a',
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 8,
    objectFit: 'contain',
  },
  paymentSection: {
    marginTop: 32,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  paymentTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  paymentLine: {
    marginBottom: 3,
    color: '#334155',
  },
});

/** Campos de paymentDetails con etiqueta visible en el PDF. */
const PAYMENT_LINES: Array<{ key: keyof PaymentDetails; label: string }> = [
  { key: 'bankName', label: 'Bank Name' },
  { key: 'accountName', label: 'Account Holder' },
  { key: 'accountNumber', label: 'IBAN / Account Number' },
  { key: 'swiftCode', label: 'SWIFT / BIC' },
  { key: 'routingNumber', label: 'Routing Number' },
  { key: 'alternativePayment', label: 'Alternative Payment' },
];

function hasText(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function filledPaymentLines(payment: PaymentDetails | undefined) {
  if (!payment) return [];
  return PAYMENT_LINES.filter(({ key }) => hasText(payment[key])).map(({ key, label }) => ({
    label,
    value: (payment[key] as string).trim(),
  }));
}

/**
 * Plantilla PDF de Commercial Invoice para exportadores B2B.
 * Jerarquía válida de @react-pdf/renderer: Document > Page > View/Text/Image.
 */
export const InvoiceDocument = ({
  data,
  subtotal,
  taxAmount,
  total,
}: {
  data: Invoice;
  subtotal: number;
  taxAmount: number;
  total: number;
}) => {
  const taxRate = Number.isFinite(data.taxRate) ? data.taxRate : 0;
  const showTaxLine = taxRate > 0 && taxAmount > 0;
  const paymentLines = filledPaymentLines(data.paymentDetails);

  return (
    <Document title="COMMERCIAL INVOICE" author={data.company.name || undefined}>
      <Page size="A4" style={styles.page}>
        {/* Header: título estático + metadatos / logo */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>COMMERCIAL INVOICE</Text>
            <Text style={styles.meta}>Invoice No: {data.invoiceNumber || '—'}</Text>
            <Text style={styles.meta}>Issue Date: {data.date || '—'}</Text>
            {hasText(data.dueDate) ? <Text style={styles.meta}>Due Date: {data.dueDate}</Text> : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {hasText(data.company.logoUrl) ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no `alt` prop.
              <Image src={data.company.logoUrl} style={styles.logo} />
            ) : null}
          </View>
        </View>

        {/* Emisor / Cliente */}
        <View style={styles.parties}>
          <View style={styles.partyColumn}>
            <Text style={styles.sectionLabel}>FROM (SELLER)</Text>
            <Text style={styles.partyName}>{data.company.name || 'Seller'}</Text>
            {hasText(data.company.address) ? <Text style={styles.text}>{data.company.address}</Text> : null}
            {hasText(data.company.email) ? <Text style={styles.text}>{data.company.email}</Text> : null}
            {hasText(data.company.taxId) ? (
              <Text style={styles.text}>Tax ID: {data.company.taxId.trim()}</Text>
            ) : null}
          </View>
          <View style={styles.partyColumn}>
            <Text style={styles.sectionLabel}>BILL TO (BUYER)</Text>
            <Text style={styles.partyName}>{data.client.name || 'Buyer'}</Text>
            {hasText(data.client.address) ? <Text style={styles.text}>{data.client.address}</Text> : null}
            {hasText(data.client.email) ? <Text style={styles.text}>{data.client.email}</Text> : null}
            {hasText(data.client.taxId) ? (
              <Text style={styles.text}>Tax ID: {data.client.taxId.trim()}</Text>
            ) : null}
          </View>
        </View>

        {/* Line items */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>
          {data.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description || '—'}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.price, data.currency)}</Text>
              <Text style={styles.colTotal}>
                {formatCurrency(item.quantity * item.price, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales: Subtotal + taxRate manual (omitido si 0) + Total */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(subtotal, data.currency)}</Text>
          </View>
          {showTaxLine ? (
            <View style={styles.totalRow}>
              <Text>Tax / Retention ({taxRate}%):</Text>
              <Text>{formatCurrency(taxAmount, data.currency)}</Text>
            </View>
          ) : null}
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text>Total:</Text>
            <Text>{formatCurrency(total, data.currency)}</Text>
          </View>
        </View>

        {/* Payment Instructions: solo si hay al menos un campo completado */}
        {paymentLines.length > 0 ? (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Payment Instructions</Text>
            {paymentLines.map((line) => (
              <Text key={line.label} style={styles.paymentLine}>
                {line.label}: {line.value}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};
