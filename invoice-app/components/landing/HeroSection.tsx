import React from 'react';
import Link from 'next/link';
import { OPERATOR_NAME, PRODUCT_NAME, PRODUCT_TAGLINE } from '@/utils/brand';

export default function HeroSection() {
  return (
    <section className="px-4 py-16 text-center md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {OPERATOR_NAME}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          {PRODUCT_NAME}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 sm:text-xl">
          {PRODUCT_TAGLINE} for B2B service exporters. Build professional commercial invoices with Tax ID,
          payment instructions and multi-currency totals — then download a clean PDF.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/app"
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
          >
            Start free
          </Link>
          <a
            href="#precios"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:w-auto"
          >
            View pricing
          </a>
        </div>

        <p className="mt-4 text-sm text-slate-400">No credit card required to start.</p>
      </div>
    </section>
  );
}
