import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';
import { PRO_PRICE_USD_LABEL } from '@/utils/stripe/constants';
import {
  LEMON_SQUEEZY_MOR_NOTICE,
  OPERATOR_NAME,
  PRODUCT_NAME,
  PRODUCT_TITLE,
  SUPPORT_EMAIL,
} from '@/utils/brand';

export const metadata: Metadata = {
  title: `Terms — ${PRODUCT_TITLE}`,
  description: `Terms of Service for ${PRODUCT_NAME} by ${OPERATOR_NAME}.`,
};

const LAST_UPDATED = '17 de julio de 2026';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <aside
        className="rounded-lg border border-slate-300 bg-slate-100 p-4 text-slate-800"
        aria-label="Merchant of Record notice"
      >
        <h2 className="mb-2 text-base font-semibold text-slate-900">Merchant of Record</h2>
        <p className="font-medium leading-relaxed">{LEMON_SQUEEZY_MOR_NOTICE}</p>
      </aside>

      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to and use of{' '}
        <strong>{PRODUCT_NAME}</strong> (the &quot;Service&quot;), a Commercial Invoice Generator operated by{' '}
        {OPERATOR_NAME}. By accessing or using the Service you agree to these Terms. If you do not agree,
        do not use the Service.
      </p>

      <LegalSection title="1. Service Description">
        <p>
          {PRODUCT_NAME} helps B2B service exporters create, preview and download Commercial Invoices as PDF.
          The Service offers two access levels:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Free plan:</strong> unlimited invoice creation, live preview and PDF download, without
            requiring an account.
          </li>
          <li>
            <strong>Pro plan ({PRO_PRICE_USD_LABEL} USD, one-time):</strong> cloud storage, invoice dashboard,
            sequential numbering and custom logo upload. Pro is a one-time payment for lifetime access to
            these features, with no recurring charges.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. User Accounts">
        <p>
          Pro features require an account created via a magic link sent to your email (no password). You are
          responsible for access to that email and for activity under your account.
        </p>
      </LegalSection>

      <LegalSection title="3. Payments, Billing & Taxes">
        <p>{LEMON_SQUEEZY_MOR_NOTICE}</p>
        <p>
          We do not store your card details. Payments are processed securely by Lemon Squeezy under their
          terms and security standards (including PCI-DSS). After a successful payment, Pro access is linked
          to the email used for the purchase.
        </p>
        <p>
          For refunds, see our{' '}
          <a className="underline" href="/refund">
            Refund Policy
          </a>{' '}
          or email{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Use the Service for illegal, fraudulent or infringing activities.</li>
          <li>Attempt to breach, overload or compromise the Service.</li>
          <li>Resell or sublicense the Service without written permission.</li>
          <li>Upload content that violates third-party intellectual property rights.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Ownership & User Content">
        <p>
          You retain all rights to the data you enter into invoices. We process that content only to provide
          the Service, as described in our{' '}
          <a className="underline" href="/privacy">
            Privacy Policy
          </a>
          . The {PRODUCT_NAME} software, brand and UI are owned by {OPERATOR_NAME}.
        </p>
      </LegalSection>

      <LegalSection title="6. Availability">
        <p>
          We aim for continuous availability but do not guarantee uninterrupted or error-free operation.
          Maintenance, updates or third-party outages may temporarily affect the Service.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of Liability">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot;. To the maximum extent
          permitted by law, we are not liable for indirect, incidental, special or consequential damages
          arising from use of the Service.
        </p>
      </LegalSection>

      <LegalSection title="8. Termination">
        <p>
          You may stop using the Service and request account deletion at any time by emailing{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          . We may suspend accounts that violate these Terms.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update these Terms from time to time. Changes will be posted on this page with an updated
          &quot;Last updated&quot; date. Continued use constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these Terms:{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
