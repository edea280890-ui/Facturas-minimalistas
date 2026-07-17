import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';
import { PRO_PRICE_USD_LABEL } from '@/utils/stripe/constants';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Generador de Facturas',
  description: 'Términos y Condiciones de uso del servicio Generador de Facturas.',
};

const LAST_UPDATED = '17 de julio de 2026';
const SUPPORT_EMAIL = 'soporte@sirappstudio.com';

/** Texto obligatorio Merchant of Record (Lemon Squeezy). No modificar. */
const LEMON_SQUEEZY_MOR_NOTICE =
  'El procesamiento de pagos, la facturación y la recaudación de impuestos de las suscripciones generadas en este sitio web son operados y gestionados de forma segura por Lemon Squeezy. Lemon Squeezy actúa como el comerciante registrado (Merchant of Record) oficial para todas nuestras transacciones globales.';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Términos y Condiciones" lastUpdated={LAST_UPDATED}>
      <aside
        className="rounded-lg border border-slate-300 bg-slate-100 p-4 text-slate-800"
        aria-label="Aviso Merchant of Record"
      >
        <h2 className="mb-2 text-base font-semibold text-slate-900">Merchant of Record</h2>
        <p className="font-medium leading-relaxed">{LEMON_SQUEEZY_MOR_NOTICE}</p>
      </aside>

      <p>
        Estos Términos y Condiciones (&quot;Términos&quot;) regulan el acceso y uso del servicio
        <strong> Generador de Facturas</strong> (el &quot;Servicio&quot;), operado como un producto de software
        como servicio (SaaS). Al acceder o utilizar el Servicio aceptas quedar sujeto a estos Términos.
        Si no estás de acuerdo con alguna parte de ellos, no debes utilizar el Servicio.
      </p>

      <LegalSection title="1. Descripción del Servicio">
        <p>
          Generador de Facturas es una herramienta que permite crear, previsualizar y exportar facturas
          comerciales (Commercial Invoices) en formato PDF. El Servicio ofrece dos niveles de acceso:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Plan Gratuito:</strong> creación ilimitada de facturas, previsualización en vivo y
            descarga en PDF, sin necesidad de crear una cuenta.
          </li>
          <li>
            <strong>Plan Pro ({PRO_PRICE_USD_LABEL} USD, pago único):</strong> incluye además guardado de
            facturas en la nube, un panel de gestión (&quot;Mis facturas&quot;) para consultarlas, editarlas y
            eliminarlas, numeración automática secuencial y carga de logo personalizado. El Plan Pro es un
            pago único que otorga acceso de por vida a estas funciones, sin cobros recurrentes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Cuentas de Usuario">
        <p>
          Para acceder a las funciones del Plan Pro es necesario crear una cuenta mediante un enlace de
          acceso enviado a tu correo electrónico (&quot;Magic Link&quot;), sin necesidad de contraseña. Eres
          responsable de mantener el acceso a tu correo electrónico y de toda la actividad que ocurra bajo tu
          cuenta. Debes notificarnos de inmediato ante cualquier uso no autorizado de tu cuenta.
        </p>
      </LegalSection>

      <LegalSection title="3. Pagos, Facturación e Impuestos">
        <p>{LEMON_SQUEEZY_MOR_NOTICE}</p>
        <p>
          El Plan Pro se cobra como un pago único. No almacenamos los datos de tu tarjeta de pago; estos son
          procesados de forma segura por Lemon Squeezy bajo sus propios términos y estándares de seguridad
          (incluyendo PCI-DSS). Tras un pago exitoso, el acceso Pro se asocia al correo electrónico usado en
          la compra.
        </p>
        <p>
          Para solicitudes de reembolso, consulta nuestra{' '}
          <a className="underline" href="/refund">
            Política de Reembolso
          </a>{' '}
          o escribe a{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Uso Aceptable">
        <p>Al utilizar el Servicio te comprometes a no:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Utilizar el Servicio para actividades ilegales, fraudulentas o que infrinjan derechos de terceros.</li>
          <li>Intentar vulnerar, sobrecargar o comprometer la seguridad o disponibilidad del Servicio.</li>
          <li>Revender, sublicenciar o redistribuir el Servicio sin autorización expresa.</li>
          <li>Cargar contenido difamatorio, ofensivo o que infrinja derechos de propiedad intelectual de terceros.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Propiedad y Contenido del Usuario">
        <p>
          Tú conservas todos los derechos sobre los datos que introduces en tus facturas (información de tu
          empresa, tus clientes, conceptos y montos). Nosotros no reclamamos propiedad sobre dicho contenido;
          únicamente lo almacenamos y procesamos para prestarte el Servicio, según se describe en nuestra{' '}
          <a className="underline" href="/privacy">
            Política de Privacidad
          </a>
          .
        </p>
        <p>
          El software, marca, diseño e interfaz del Generador de Facturas son propiedad exclusiva del
          operador del Servicio y están protegidos por las leyes de propiedad intelectual aplicables.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilidad del Servicio">
        <p>
          Nos esforzamos por mantener el Servicio disponible de forma continua, pero no garantizamos que
          funcione de manera ininterrumpida o libre de errores. Podemos suspender temporalmente el Servicio
          por mantenimiento, actualizaciones o causas de fuerza mayor, incluyendo interrupciones de
          proveedores externos de infraestructura (hosting, base de datos o procesamiento de pagos).
        </p>
      </LegalSection>

      <LegalSection title="7. Limitación de Responsabilidad">
        <p>
          El Servicio se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;, sin garantías de
          ningún tipo, expresas o implícitas. En la máxima medida permitida por la ley aplicable, no seremos
          responsables por daños indirectos, incidentales, especiales o consecuentes derivados del uso o la
          imposibilidad de uso del Servicio, incluyendo pérdida de datos o de ingresos.
        </p>
      </LegalSection>

      <LegalSection title="8. Terminación">
        <p>
          Puedes dejar de usar el Servicio y solicitar la eliminación de tu cuenta y tus datos en cualquier
          momento, escribiendo a{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          . Podemos suspender o cancelar el acceso de cualquier cuenta que incumpla estos Términos.
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios a estos Términos">
        <p>
          Podemos actualizar estos Términos ocasionalmente. Publicaremos cualquier cambio en esta misma
          página junto con la fecha de la &quot;Última actualización&quot;. El uso continuado del Servicio
          después de un cambio implica la aceptación de los nuevos Términos.
        </p>
      </LegalSection>

      <LegalSection title="10. Contacto">
        <p>
          Si tienes preguntas sobre estos Términos, puedes escribirnos a{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
