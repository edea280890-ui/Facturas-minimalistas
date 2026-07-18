import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';
import { PRODUCT_NAME, PRODUCT_TITLE } from '@/utils/brand';

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
          de cuenta y datos de uso técnico para optimización). La información que usted ingresa para generar
          facturas se procesa localmente en su navegador y no se almacena en nuestros servidores de forma
          persistente.
        </p>
      </LegalSection>

      <LegalSection title="2. Seguridad Financiera y Pagos">
        <p>
          Sirapp Studio no recopila ni almacena números de tarjetas de crédito. Toda la información
          financiera es cifrada y procesada externamente por Lemon Squeezy, operando bajo estrictos
          estándares PCI-DSS.
        </p>
      </LegalSection>

      <LegalSection title="3. Uso de la Información">
        <p>
          No vendemos, alquilamos ni compartimos sus datos con terceros bajo ninguna circunstancia. Su
          correo electrónico es utilizado exclusivamente para comunicaciones del sistema y soporte técnico.
        </p>
      </LegalSection>

      <LegalSection title="4. Contacto y Derechos">
        <p>
          Para ejercer sus derechos sobre sus datos, solicitar la eliminación de su cuenta o realizar
          consultas de privacidad, contáctenos en:{' '}
          <a className="underline" href="mailto:soporte@facturaexterior.com">
            soporte@facturaexterior.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
