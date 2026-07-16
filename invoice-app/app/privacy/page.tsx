import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';

export const metadata: Metadata = {
  title: 'Política de Privacidad — Generador de Facturas',
  description: 'Política de Privacidad del servicio Generador de Facturas.',
};

const LAST_UPDATED = '16 de julio de 2026';
const CONTACT_EMAIL = 'edea280890@gmail.com';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Política de Privacidad" lastUpdated={LAST_UPDATED}>
      <p>
        En <strong>Generador de Facturas</strong> nos tomamos en serio la privacidad de tus datos. Esta
        Política de Privacidad explica qué información recopilamos, cómo la usamos y qué derechos tienes
        sobre ella.
      </p>

      <LegalSection title="1. Qué información recopilamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Datos de cuenta:</strong> tu dirección de correo electrónico, utilizada únicamente para
            autenticarte mediante enlaces de acceso (&quot;Magic Link&quot;), sin contraseñas.
          </li>
          <li>
            <strong>Datos de facturación de tus facturas:</strong> si utilizas el Plan Pro para guardar
            facturas en la nube, almacenamos la información que tú introduces (datos de tu empresa, de tus
            clientes, conceptos, importes y divisa), así como el logo que decidas subir de forma opcional.
          </li>
          <li>
            <strong>Datos de pago:</strong> cuando adquieres el Plan Pro, el procesamiento del pago lo
            realiza directamente nuestro proveedor de pagos externo. No almacenamos números de tarjeta ni
            datos financieros completos en nuestros propios servidores; solo recibimos una confirmación del
            pago y un identificador de cliente de dicho proveedor.
          </li>
          <li>
            <strong>Datos técnicos básicos:</strong> información estándar de uso y de servidor (por ejemplo,
            registros de errores) generada automáticamente por la infraestructura en la que se ejecuta el
            Servicio.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Cómo usamos tu información">
        <ul className="list-disc space-y-1 pl-5">
          <li>Para prestarte el Servicio: crear, guardar, listar, editar y eliminar tus facturas.</li>
          <li>Para autenticarte y proteger el acceso a tu cuenta.</li>
          <li>Para procesar tu pago y habilitar las funciones del Plan Pro.</li>
          <li>Para comunicarnos contigo sobre cambios relevantes al Servicio o a estos documentos legales.</li>
          <li>Para diagnosticar y corregir errores técnicos.</li>
        </ul>
        <p>No vendemos ni compartimos tu información personal con terceros con fines publicitarios.</p>
      </LegalSection>

      <LegalSection title="3. Con quién compartimos tu información">
        <p>Utilizamos los siguientes proveedores externos (&quot;subencargados&quot;) para operar el Servicio:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase:</strong> autenticación, base de datos y almacenamiento de archivos (logos).
          </li>
          <li>
            <strong>Proveedor de procesamiento de pagos:</strong> gestiona el cobro del Plan Pro de forma
            segura, bajo sus propios estándares de cumplimiento (incluyendo PCI-DSS).
          </li>
          <li>
            <strong>Proveedor de hosting/infraestructura:</strong> alojamiento de la aplicación web.
          </li>
        </ul>
        <p>
          Cada uno de estos proveedores procesa tus datos únicamente en la medida necesaria para prestar su
          servicio, conforme a sus propias políticas de privacidad y acuerdos de tratamiento de datos.
        </p>
      </LegalSection>

      <LegalSection title="4. Almacenamiento local y sesión">
        <p>
          El Servicio utiliza el almacenamiento local (<code>localStorage</code>) de tu navegador para
          mantener tu sesión iniciada entre visitas, evitando que tengas que autenticarte cada vez. Esta
          información permanece en tu propio dispositivo y se elimina si cierras sesión o borras los datos
          de tu navegador.
        </p>
      </LegalSection>

      <LegalSection title="5. Conservación y eliminación de datos">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar la eliminación completa de
          tu cuenta y de todas tus facturas guardadas en cualquier momento escribiendo a{' '}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Procesaremos la
          solicitud en un plazo razonable, salvo que estemos obligados a conservar cierta información por
          motivos legales o contables (por ejemplo, registros de pagos).
        </p>
      </LegalSection>

      <LegalSection title="6. Seguridad">
        <p>
          Aplicamos controles de acceso a nivel de base de datos (Row Level Security) para que cada usuario
          solo pueda ver, modificar o eliminar sus propias facturas. Ningún usuario puede otorgarse a sí
          mismo acceso premium; ese cambio solo puede realizarlo nuestro sistema de pagos de forma
          automatizada y verificada.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <p>
          Dependiendo de tu ubicación, puedes tener derecho a acceder, corregir, exportar o eliminar tus
          datos personales, así como a oponerte a determinados usos de estos. Puedes ejercer estos derechos
          escribiéndonos a <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="8. Menores de edad">
        <p>
          El Servicio no está dirigido a menores de 18 años y no recopilamos intencionalmente información de
          menores.
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios a esta Política">
        <p>
          Podemos actualizar esta Política de Privacidad ocasionalmente. Publicaremos cualquier cambio en
          esta misma página junto con la fecha de la &quot;Última actualización&quot;.
        </p>
      </LegalSection>

      <LegalSection title="10. Contacto">
        <p>
          Para cualquier consulta relacionada con la privacidad de tus datos, escríbenos a{' '}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
