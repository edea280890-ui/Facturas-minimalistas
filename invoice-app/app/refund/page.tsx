import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';
import { PRODUCT_NAME, PRODUCT_TITLE } from '@/utils/brand';

export const metadata: Metadata = {
  title: `Política de Reembolso — ${PRODUCT_TITLE}`,
  description: `Política de Reembolsos y Cancelaciones de ${PRODUCT_NAME}.`,
};

const LAST_UPDATED = '17 de Julio de 2026';

export default function RefundPage() {
  return (
    <LegalPageLayout title="Política de Reembolsos y Cancelaciones" lastUpdated={LAST_UPDATED}>
      <LegalSection title="1. Ventas Finales">
        <p>
          Al tratarse de un software de acceso inmediato (SaaS), todas las ventas son finales. No se
          emitirán reembolsos totales ni parciales una vez que el pago ha sido procesado y el acceso ha sido
          otorgado.
        </p>
      </LegalSection>

      <LegalSection title="2. Cancelación de Suscripción">
        <p>
          Usted puede cancelar la renovación automática en cualquier momento desde su panel de control.
          Mantendrá el acceso completo a las funciones adquiridas hasta la finalización del periodo de
          facturación actual.
        </p>
      </LegalSection>

      <LegalSection title="3. Disputas de Pago">
        <p>
          Cualquier intento de contracargo (chargeback) injustificado resultará en la suspensión inmediata y
          permanente de su cuenta.
        </p>
      </LegalSection>

      <LegalSection title="4. Usuarios de Acceso Ilimitado">
        <p>
          El Acceso Ilimitado está estrictamente condicionado a la existencia y continuidad operativa del
          Servicio. Si el servicio se interrumpe o cierra permanentemente, los usuarios de Acceso
          Ilimitado no tendrán derecho a compensaciones monetarias ni reembolsos una vez vencido el
          periodo de aviso previo de 30 días definido en los Términos de Servicio.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
