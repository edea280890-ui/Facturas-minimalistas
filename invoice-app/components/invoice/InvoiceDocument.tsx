import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/utils/formatCurrency';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#334155' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  title: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  label: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 4, color: '#64748b' },
  text: { marginBottom: 2 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 5, marginBottom: 5, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  colDesc: { width: '50%' }, colQty: { width: '15%', textAlign: 'center' }, colPrice: { width: '15%', textAlign: 'right' }, colTotal: { width: '20%', textAlign: 'right' },
  totals: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '40%', paddingVertical: 4 },
  finalTotal: { fontFamily: 'Helvetica-Bold', fontSize: 12, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 4, marginTop: 4, color: '#0f172a' },
  logo: { width: 48, height: 48, marginBottom: 8, objectFit: 'contain' },
});

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
  const showTax = taxAmount > 0;
  const payment = data.paymentDetails;
  const hasPaymentInfo = Boolean(
    payment?.bankName ||
      payment?.accountName ||
      payment?.accountNumber ||
      payment?.swiftCode ||
      payment?.routingNumber ||
      payment?.alternativePayment,
  );

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>COMMERCIAL INVOICE</Text>
          <Text style={styles.text}>No: {data.invoiceNumber}</Text>
          <Text style={styles.text}>Date: {data.date}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {data.company.logoUrl && (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image (PDF renderer) has no `alt` prop.
            <Image src={data.company.logoUrl} style={styles.logo} />
          )}
          <Text style={styles.label}>From:</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{data.company.name || 'Seller'}</Text>
          <Text style={styles.text}>{data.company.address}</Text>
          {data.company.taxId ? <Text style={styles.text}>Tax ID: {data.company.taxId}</Text> : null}
        </View>
      </View>
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Bill to:</Text>
        <Text style={{ fontFamily: 'Helvetica-Bold' }}>{data.client.name || 'Buyer'}</Text>
        <Text style={styles.text}>{data.client.address}</Text>
        {data.client.taxId ? <Text style={styles.text}>Tax ID: {data.client.taxId}</Text> : null}
      </View>
      <View>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colPrice}>Price</Text>
          <Text style={styles.colTotal}>Amount</Text>
        </View>
        {data.items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{formatCurrency(item.price, data.currency)}</Text>
            <Text style={styles.colTotal}>{formatCurrency(item.quantity * item.price, data.currency)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.totals}>
        <View style={styles.totalRow}><Text>Subtotal:</Text><Text>{formatCurrency(subtotal, data.currency)}</Text></View>
        {showTax && (
          <View style={styles.totalRow}>
            <Text>Tax ({data.taxRate}%):</Text>
            <Text>{formatCurrency(taxAmount, data.currency)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.finalTotal]}><Text>Total:</Text><Text>{formatCurrency(total, data.currency)}</Text></View>
      </View>
      {hasPaymentInfo && (
        <View style={{ marginTop: 28 }}>
          <Text style={styles.label}>Payment details</Text>
          {payment.bankName ? <Text style={styles.text}>Bank: {payment.bankName}</Text> : null}
          {payment.accountName ? <Text style={styles.text}>Account name: {payment.accountName}</Text> : null}
          {payment.accountNumber ? <Text style={styles.text}>Account number: {payment.accountNumber}</Text> : null}
          {payment.swiftCode ? <Text style={styles.text}>SWIFT/BIC: {payment.swiftCode}</Text> : null}
          {payment.routingNumber ? <Text style={styles.text}>Routing: {payment.routingNumber}</Text> : null}
          {payment.alternativePayment ? (
            <Text style={styles.text}>Alternative: {payment.alternativePayment}</Text>
          ) : null}
        </View>
      )}
    </Page>
  </Document>
  );
};
