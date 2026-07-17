import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';

export const metadata: Metadata = {
  title: 'Política de Reembolso — Generador de Facturas',
  description: 'Política de reembolsos del servicio Generador de Facturas.',
};

const LAST_UPDATED = '17 de julio de 2026';
const SUPPORT_EMAIL = 'soporte@sirappstudio.com';

export default function RefundPage() {
  return (
    <LegalPageLayout title="Política de Reembolso" lastUpdated={LAST_UPDATED}>
      <p>
        Esta Política de Reembolso describe las condiciones bajo las cuales puedes solicitar la devolución
        del pago del <strong>Plan Pro</strong> del servicio Generador de Facturas.
      </p>

      <LegalSection title="1. Merchant of Record">
        <p>
          El procesamiento de pagos, la facturación y la recaudación de impuestos de las suscripciones
          generadas en este sitio web son operados y gestionados de forma segura por Lemon Squeezy. Lemon
          Squeezy actúa como el comerciante registrado (Merchant of Record) oficial para todas nuestras
          transacciones globales.
        </p>
        <p>
          Las solicitudes de reembolso pueden gestionarse a través de nuestro equipo de soporte y/o de los
          canales que Lemon Squeezy ponga a disposición del comprador, según corresponda.
        </p>
      </LegalSection>

      <LegalSection title="2. Plazo de reembolso">
        <p>
          Ofrecemos un <strong>reembolso completo</strong> si lo solicitas dentro de los{' '}
          <strong>14 días</strong> posteriores a la fecha de compra del Plan Pro.
        </p>
        <p>
          Pasado ese plazo, el pago no es reembolsable, salvo que la ley aplicable en tu jurisdicción
          disponga lo contrario o que Lemon Squeezy, en su calidad de Merchant of Record, esté obligado a
          procesar un reembolso conforme a la normativa vigente.
        </p>
      </LegalSection>

      <LegalSection title="3. Cómo solicitar un reembolso">
        <p>Para iniciar una solicitud, envía un correo a:</p>
        <p>
          <a className="font-medium underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p>Incluye, por favor:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>El correo electrónico con el que realizaste la compra.</li>
          <li>La fecha aproximada del pago.</li>
          <li>El número de pedido o recibo de Lemon Squeezy, si lo tienes.</li>
          <li>Una breve descripción del motivo de la solicitud.</li>
        </ul>
        <p>
          Responderemos en un plazo razonable y, si la solicitud cumple esta política, coordinaremos el
          reembolso a través de Lemon Squeezy hacia el método de pago original.
        </p>
      </LegalSection>

      <LegalSection title="4. Efectos del reembolso">
        <p>
          Una vez procesado el reembolso, el acceso a las funciones del Plan Pro asociadas a tu cuenta podrá
          ser revocado. El Plan Gratuito (creación y descarga de PDF) seguirá disponible.
        </p>
      </LegalSection>

      <LegalSection title="5. Contacto">
        <p>
          Si tienes dudas sobre esta política, escríbenos a{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          . También puedes revisar nuestros{' '}
          <a className="underline" href="/terms">
            Términos y Condiciones
          </a>{' '}
          y la{' '}
          <a className="underline" href="/privacy">
            Política de Privacidad
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
