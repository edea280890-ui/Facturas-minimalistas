import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import LegalSection from '@/components/legal/LegalSection';
import { LEMON_SQUEEZY_MOR_NOTICE, OPERATOR_NAME, PRODUCT_NAME, PRODUCT_TITLE, SUPPORT_EMAIL } from '@/utils/brand';

export const metadata: Metadata = {
  title: `Refund — ${PRODUCT_TITLE}`,
  description: `Refund Policy for ${PRODUCT_NAME} by ${OPERATOR_NAME}.`,
};

const LAST_UPDATED = '17 de julio de 2026';

export default function RefundPage() {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated={LAST_UPDATED}>
      <p>
        This Refund Policy explains when you may request a refund for the <strong>{PRODUCT_NAME} Pro</strong>{' '}
        plan.
      </p>

      <LegalSection title="1. Merchant of Record">
        <p>{LEMON_SQUEEZY_MOR_NOTICE}</p>
        <p>
          Refund requests may be handled by our support team and/or Lemon Squeezy customer channels, as
          applicable.
        </p>
      </LegalSection>

      <LegalSection title="2. Refund window">
        <p>
          We offer a <strong>full refund</strong> if you request it within <strong>14 days</strong> of the Pro
          purchase date. After that window, payments are non-refundable except where required by applicable
          law or by Lemon Squeezy as Merchant of Record.
        </p>
      </LegalSection>

      <LegalSection title="3. How to request a refund">
        <p>
          Email{' '}
          <a className="font-medium underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>{' '}
          with:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>The email used for the purchase</li>
          <li>Approximate purchase date</li>
          <li>Lemon Squeezy order / receipt number (if available)</li>
          <li>A brief reason for the request</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. After a refund">
        <p>
          Once refunded, Pro cloud features may be revoked. The free plan (create and download PDF) remains
          available.
        </p>
      </LegalSection>

      <LegalSection title="5. Contact">
        <p>
          Questions:{' '}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
