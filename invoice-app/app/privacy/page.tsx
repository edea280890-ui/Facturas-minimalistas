import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';
import { PRODUCT_NAME, PRODUCT_TITLE, SUPPORT_EMAIL } from '@/utils/brand';

export const metadata: Metadata = {
  title: `Política de Privacidad — ${PRODUCT_TITLE}`,
  description: `Política de Privacidad de ${PRODUCT_NAME}.`,
};

const LAST_UPDATED = '17 de Julio de 2026';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Política de Privacidad" lastUpdated={LAST_UPDATED}>
      <LegalSection title="1. Recopilación de Datos">
        <p>
          Recopilamos únicamente la información mínima necesaria para el funcionamiento del Servicio (datos
          de cuenta y datos de uso técnico). La información ingresada para generar facturas se procesa en su
          navegador y no se almacena en nuestros servidores de forma persistente.
        </p>
      </LegalSection>

      <LegalSection title="2. Seguridad Financiera">
        <p>
          Sirapp Studio no almacena números de tarjetas de crédito. Toda la información financiera es
          procesada externamente por Lemon Squeezy, operando bajo estándares PCI-DSS.
        </p>
      </LegalSection>

      <LegalSection title="3. Uso de la Información">
        <p>
          No vendemos ni compartimos sus datos con terceros. Su correo electrónico es utilizado
          exclusivamente para comunicaciones del sistema y soporte técnico.
        </p>
      </LegalSection>

      <LegalSection title="4. Contacto">
        <p>
          Para ejercer sus derechos sobre sus datos o realizar consultas, contáctenos en:{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
