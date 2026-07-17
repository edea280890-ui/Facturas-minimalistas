import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';
import {
  LEMON_SQUEEZY_MOR_NOTICE,
  LEMON_SQUEEZY_OPERATOR_PAYMENTS,
  PRODUCT_NAME,
  PRODUCT_TITLE,
  SUPPORT_EMAIL,
} from '@/utils/brand';

export const metadata: Metadata = {
  title: `Términos y Condiciones — ${PRODUCT_TITLE}`,
  description: `Términos y Condiciones de Servicio de ${PRODUCT_NAME}.`,
};

const LAST_UPDATED = '17 de Julio de 2026';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Términos y Condiciones de Servicio" lastUpdated={LAST_UPDATED}>
      <aside
        className="rounded-lg border border-slate-300 bg-slate-100 p-4 text-slate-800"
        aria-label="Aviso Merchant of Record"
      >
        <h2 className="mb-2 text-base font-semibold text-slate-900">Merchant of Record</h2>
        <p className="font-medium leading-relaxed">{LEMON_SQUEEZY_MOR_NOTICE}</p>
      </aside>

      <p>
        Bienvenido a FacturaExterior. Al acceder y utilizar nuestro generador de facturas, usted acepta los
        siguientes términos:
      </p>

      <LegalSection title="1. Operador y Pagos">
        <p>{LEMON_SQUEEZY_OPERATOR_PAYMENTS}</p>
      </LegalSection>

      <LegalSection title="2. Uso del Servicio">
        <p>
          FacturaExterior es una herramienta para la creación de documentos comerciales. Usted es el único
          responsable de la exactitud de los datos ingresados y de asegurar el cumplimiento de las
          normativas fiscales de su jurisdicción. Sirapp Studio no brinda asesoramiento legal ni fiscal.
        </p>
      </LegalSection>

      <LegalSection title="3. Propiedad Intelectual">
        <p>
          Todo el código, diseño y arquitectura de FacturaExterior son propiedad exclusiva de Sirapp Studio.
          Se otorga una licencia limitada y no transferible para su uso.
        </p>
      </LegalSection>

      <LegalSection title="4. Limitación de Responsabilidad">
        <p>
          El Servicio se proporciona &quot;tal cual&quot;. Sirapp Studio no será responsable por daños
          indirectos o pérdida de datos derivados del uso de la plataforma.
        </p>
      </LegalSection>

      <LegalSection title="5. Contacto">
        <p>
          Para soporte técnico o consultas, contáctenos en:{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Terminación o Modificación">
        <p>
          Sirapp Studio se reserva el derecho de modificar o interrumpir el Servicio en cualquier momento. En
          caso de suscripciones de acceso ilimitado (&quot;Lifetime&quot;), Sirapp Studio se compromete a
          notificar a los usuarios con al menos 30 días de antelación antes de una interrupción definitiva del
          servicio, sin que esto constituya una obligación de reembolso retroactivo, salvo lo estipulado en
          nuestra Política de Reembolso.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
