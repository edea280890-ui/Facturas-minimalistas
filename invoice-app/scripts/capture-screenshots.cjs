const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const OUT = path.resolve(__dirname, '../docs/screenshots');
const ARTIFACTS = '/opt/cursor/artifacts/screenshots';

async function ensureDirs() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(ARTIFACTS, { recursive: true });
}

async function shot(page, name, options = {}) {
  const file = `${name}.png`;
  const dest = path.join(OUT, file);
  await page.screenshot({
    path: dest,
    fullPage: options.fullPage ?? true,
    type: 'png',
  });
  fs.copyFileSync(dest, path.join(ARTIFACTS, file));
  console.log('saved', file);
}

async function safeGoto(page, url, waitMs = 1500) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, waitMs));
}

async function main() {
  await ensureDirs();
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();

  // 01 Landing
  await safeGoto(page, `${BASE}/`);
  await shot(page, '01-landing-home');

  // 02 Landing pricing section
  await page.evaluate(() => {
    const el = document.querySelector('#precios') || document.body;
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise((r) => setTimeout(r, 800));
  await shot(page, '02-landing-pricing', { fullPage: false });

  // 03 App editor (form + preview)
  await safeGoto(page, `${BASE}/app`, 2500);
  await shot(page, '03-app-editor');

  // 04 Fill form fields for a richer commercial invoice view
  await page.evaluate(() => {
    const setNative = (el, value) => {
      if (!el) return;
      const proto = el instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.blur();
    };

    const labels = Array.from(document.querySelectorAll('label'));
    const byLabel = (text) => {
      const lab = labels.find((l) => (l.textContent || '').trim().toLowerCase().includes(text.toLowerCase()));
      if (!lab) return null;
      const id = lab.getAttribute('for');
      if (id) return document.getElementById(id);
      return lab.parentElement?.querySelector('input, textarea, select') || null;
    };

    setNative(byLabel('empresa') || byLabel('nombre'), 'Sirapp Studio LLC');
    setNative(byLabel('tax id'), 'US-12-3456789');
    setNative(byLabel('correo') || byLabel('email'), 'billing@sirappstudio.com');
    setNative(byLabel('dirección') || byLabel('address'), '1200 Market St, Miami, FL');
    setNative(byLabel('cliente') || byLabel('bill'), 'Acme Exports SA');
    // second tax id / client fields
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input:not([type])'));
    for (const input of inputs) {
      const ph = (input.getAttribute('placeholder') || '').toLowerCase();
      const nearby = (input.closest('div')?.querySelector('label')?.textContent || '').toLowerCase();
      if (nearby.includes('bank name') || ph.includes('chase')) setNative(input, 'Bank of America');
      if (nearby.includes('account holder')) setNative(input, 'Sirapp Studio LLC');
      if (nearby.includes('iban') || nearby.includes('account number')) setNative(input, 'US12BOFA1234567890');
      if (nearby.includes('swift')) setNative(input, 'BOFAUS3N');
      if (nearby.includes('alternative')) setNative(input, 'Wise: sirapp@wise.com');
      if (nearby.includes('descripción') || ph.includes('descripción') || ph.includes('description')) {
        setNative(input, 'B2B consulting services — Q3');
      }
    }

    const numberInputs = Array.from(document.querySelectorAll('input[type="number"]'));
    if (numberInputs[0]) setNative(numberInputs[0], '1');
    if (numberInputs[1]) setNative(numberInputs[1], '1500');
  });
  await new Promise((r) => setTimeout(r, 1200));
  await shot(page, '04-app-filled-invoice');

  // 05 Scroll to payment details
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h3, h2, label'));
    const pay = headings.find((h) => /payment/i.test(h.textContent || ''));
    (pay || document.body).scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 600));
  await shot(page, '05-app-payment-details', { fullPage: false });

  // 06 Login
  await safeGoto(page, `${BASE}/login`);
  await shot(page, '06-login');

  // 07 Terms
  await safeGoto(page, `${BASE}/terms`);
  await shot(page, '07-terms');

  // 08 Privacy
  await safeGoto(page, `${BASE}/privacy`);
  await shot(page, '08-privacy');

  // 09 Refund
  await safeGoto(page, `${BASE}/refund`);
  await shot(page, '09-refund');

  // 10 Acceso denegado / Pro gate
  await safeGoto(page, `${BASE}/acceso-denegado`);
  await shot(page, '10-acceso-denegado-pro');

  // Bonus mobile viewport of app
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await safeGoto(page, `${BASE}/app`, 2000);
  await shot(page, '11-app-mobile');

  await browser.close();
  console.log('Done. Screenshots in', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
