import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';

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
  finalTotal: { fontFamily: 'Helvetica-Bold', fontSize: 12, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 4, marginTop: 4, color: '#0f172a' }
});

export const InvoiceDocument = ({ data, subtotal, total }: { data: Invoice, subtotal: number, total: number }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>FACTURA</Text>
          <Text style={styles.text}>Nº: {data.invoiceNumber}</Text>
          <Text style={styles.text}>Fecha: {data.date}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>De:</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{data.company.name || 'Emisor'}</Text>
          <Text style={styles.text}>{data.company.address}</Text>
        </View>
      </View>
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Facturar a:</Text>
        <Text style={{ fontFamily: 'Helvetica-Bold' }}>{data.client.name || 'Cliente'}</Text>
        <Text style={styles.text}>{data.client.address}</Text>
      </View>
      <View>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Descripción</Text>
          <Text style={styles.colQty}>Cant.</Text>
          <Text style={styles.colPrice}>Precio</Text>
          <Text style={styles.colTotal}>Importe</Text>
        </View>
        {data.items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{item.price.toFixed(2)}</Text>
            <Text style={styles.colTotal}>{(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.totals}>
        <View style={styles.totalRow}><Text>Subtotal:</Text><Text>{subtotal.toFixed(2)} {data.currency}</Text></View>
        <View style={styles.totalRow}><Text>IVA ({data.taxRate}%):</Text><Text>{(total - subtotal).toFixed(2)} {data.currency}</Text></View>
        <View style={[styles.totalRow, styles.finalTotal]}><Text>Total:</Text><Text>{total.toFixed(2)} {data.currency}</Text></View>
      </View>
    </Page>
  </Document>
);
