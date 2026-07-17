import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';
import { LEMON_SQUEEZY_MOR_NOTICE, OPERATOR_NAME, PRODUCT_NAME, PRODUCT_TITLE, SUPPORT_EMAIL } from '@/utils/brand';

export const metadata: Metadata = {
  title: `Privacy — ${PRODUCT_TITLE}`,
  description: `Privacy Policy for ${PRODUCT_NAME} by ${OPERATOR_NAME}.`,
};

const LAST_UPDATED = '17 de julio de 2026';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p>
        <strong>{PRODUCT_NAME}</strong> by {OPERATOR_NAME} respects your privacy. This Policy explains what
        information we collect, how we use it and your rights.
      </p>

      <LegalSection title="1. Information we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account data:</strong> your email address, used for magic-link authentication.
          </li>
          <li>
            <strong>Invoice data:</strong> if you use Pro cloud storage, we store the company, client, line
            items, amounts, currency, Tax ID and payment details you enter, plus optional logos.
          </li>
          <li>
            <strong>Payment data:</strong> {LEMON_SQUEEZY_MOR_NOTICE} We do not store full card numbers on
            our servers.
          </li>
          <li>
            <strong>Technical data:</strong> basic server logs needed to operate and debug the Service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To provide the Service (create, save, list, edit and delete invoices).</li>
          <li>To authenticate and protect your account.</li>
          <li>To process Pro payments via Lemon Squeezy.</li>
          <li>To communicate material changes to the Service or legal documents.</li>
          <li>To diagnose and fix technical issues.</li>
        </ul>
        <p>We do not sell personal information for advertising.</p>
      </LegalSection>

      <LegalSection title="3. Processors">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase:</strong> auth, database and file storage.
          </li>
          <li>
            <strong>Lemon Squeezy:</strong> Merchant of Record for payments, invoicing and tax collection.
          </li>
          <li>
            <strong>Vercel</strong> (or equivalent): application hosting.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Retention & deletion">
        <p>
          We keep your data while your account is active. Request deletion at{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          . We will process requests within a reasonable time, except where law requires retention of certain
          payment records held by Lemon Squeezy.
        </p>
      </LegalSection>

      <LegalSection title="5. Your rights">
        <p>
          Depending on your location, you may have rights to access, correct, export or delete your personal
          data. Contact{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          Privacy questions:{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
