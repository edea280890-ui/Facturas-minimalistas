/**
 * Capturas: formulario, previsualización PDF, descarga PDF y precios/pago.
 */
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const BASE = process.env.APP_URL || 'http://localhost:3000';
const OUT = process.env.OUT_DIR || '/opt/cursor/artifacts/screenshots';
const DOCS = '/workspace/docs/screenshots';

async function setInputValue(page, elHandle, value) {
  await page.evaluate(
    (el, val) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },
    elHandle,
    value,
  );
}

async function fillByLabelInRoot(page, rootHandle, labelText, value) {
  const handle = await page.evaluateHandle(
    (root, label) => {
      const scope = root || document;
      const labels = Array.from(scope.querySelectorAll('label'));
      const match = labels.find((l) => l.textContent?.trim() === label);
      if (!match) return null;
      return match.parentElement?.querySelector('input, textarea, select') || null;
    },
    rootHandle,
    labelText,
  );
  const el = handle.asElement();
  if (!el) throw new Error(`No input for label: ${labelText}`);
  await setInputValue(page, el, value);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(DOCS, { recursive: true });

  // Limpiar capturas previas de esta sesión
  for (const f of fs.readdirSync(OUT)) {
    if (/\.(png|pdf)$/.test(f)) fs.unlinkSync(path.join(OUT, f));
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/local/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
    defaultViewport: { width: 1440, height: 1100, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: OUT,
  });

  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes('Emisor'), { timeout: 30000 });

  // Columna del formulario = primer section del grid gap-8 (formulario | preview)
  const formCol = await page.waitForSelector('div.max-w-7xl > div.grid.gap-8 > section:nth-child(1)', {
    timeout: 15000,
  });
  const previewCol = await page.waitForSelector('div.max-w-7xl > div.grid.gap-8 > section:nth-child(2)', {
    timeout: 15000,
  });

  await fillByLabelInRoot(page, formCol, 'Nº Factura', 'FAC-2026-0042');
  await fillByLabelInRoot(page, formCol, 'Fecha Emisión', '2026-07-16');
  await fillByLabelInRoot(page, formCol, 'Vencimiento', '2026-07-30');
  await fillByLabelInRoot(page, formCol, 'Empresa / Nombre', 'Studio Norte Digital');
  await fillByLabelInRoot(page, formCol, 'Correo', 'facturas@studionorte.mx');
  await fillByLabelInRoot(page, formCol, 'Dirección', 'Av. Reforma 222, CDMX');
  await fillByLabelInRoot(page, formCol, 'ID Fiscal', 'SND980715ABC');
  await fillByLabelInRoot(page, formCol, 'Empresa / Cliente', 'Café Aurora S.A. de C.V.');
  await fillByLabelInRoot(page, formCol, 'Correo Electrónico', 'compras@cafeaurora.mx');

  // Dirección del cliente (segunda aparición de "Dirección" dentro del form)
  await page.evaluate((root) => {
    const labels = Array.from(root.querySelectorAll('label')).filter((l) => l.textContent?.trim() === 'Dirección');
    const input = labels[1]?.parentElement?.querySelector('input');
    if (!input) throw new Error('Client address input missing');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, 'Calle Hidalgo 45, Guadalajara');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, formCol);

  await page.evaluate((root) => {
    const set = (el, val) => {
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    set(root.querySelector('input[placeholder="Descripción"]'), 'Diseño de identidad visual y menú digital');
    set(root.querySelector('input[placeholder="Cant."]'), '1');
    set(root.querySelector('input[placeholder="Precio"]'), '8500');
  }, formCol);

  // Esperar botón Descargar PDF listo y que el preview deje de decir "Cargando"
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('a')).some((a) => a.textContent?.includes('Descargar PDF')),
    { timeout: 30000 },
  );
  // Dar tiempo a @react-pdf para regenerar el documento con los nuevos datos
  await new Promise((r) => setTimeout(r, 5000));

  // Scroll al editor (form + preview)
  await page.evaluate(() => {
    document.querySelector('div.max-w-7xl > div.grid.gap-8')?.scrollIntoView({ block: 'start' });
  });
  await new Promise((r) => setTimeout(r, 400));

  // 1) Formulario
  await formCol.screenshot({ path: path.join(OUT, '01-formulario.png') });

  // 2) Previsualización (columna completa: botón + PDF viewer)
  await previewCol.screenshot({ path: path.join(OUT, '02-previsualizacion.png') });

  // 3) App completa (viewport del editor)
  await page.screenshot({ path: path.join(OUT, '03-app-completa.png'), fullPage: false });

  // 4) Botón Descargar PDF — buscar el <a> exacto
  const downloadHandle = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('a')).find((a) => a.textContent?.trim() === 'Descargar PDF') || null;
  });
  const downloadEl = downloadHandle.asElement();
  if (!downloadEl) throw new Error('Botón Descargar PDF no encontrado');

  await downloadEl.evaluate((el) => {
    el.style.outline = '3px solid #059669';
    el.style.outlineOffset = '6px';
    el.scrollIntoView({ block: 'center', inline: 'end' });
  });
  await new Promise((r) => setTimeout(r, 300));

  // Captura del área preview enfocada en el botón + viewer
  await previewCol.screenshot({ path: path.join(OUT, '04-descargar-pdf.png') });

  // Descargar PDF real
  const before = new Set(fs.readdirSync(OUT));
  await downloadEl.click();

  let pdfName = null;
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 400));
    const files = fs.readdirSync(OUT);
    const found = files.find((f) => f.endsWith('.pdf') && !before.has(f) && !f.endsWith('.crdownload'));
    if (found) {
      pdfName = found;
      break;
    }
  }
  if (!pdfName) throw new Error(`PDF no descargado. OUT=${fs.readdirSync(OUT).join(',')}`);
  fs.copyFileSync(path.join(OUT, pdfName), path.join(OUT, '05-factura-generada.pdf'));
  console.log('PDF OK:', pdfName, fs.statSync(path.join(OUT, pdfName)).size, 'bytes');

  // 5) Precios / pago Pro
  await page.evaluate(() => {
    document.getElementById('precios')?.scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 400));
  const pricing = await page.$('#precios');
  if (pricing) await pricing.screenshot({ path: path.join(OUT, '06-precios-pago-pro.png') });

  const mapping = {
    '01-formulario.png': 'formulario-factura.png',
    '02-previsualizacion.png': 'previsualizacion-pdf.png',
    '03-app-completa.png': 'app-formulario-y-preview.png',
    '04-descargar-pdf.png': 'descargar-pdf.png',
    '05-factura-generada.pdf': 'factura-ejemplo.pdf',
    '06-precios-pago-pro.png': 'precios-pago-pro.png',
  };
  for (const [src, dest] of Object.entries(mapping)) {
    const from = path.join(OUT, src);
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, path.join(DOCS, dest));
      fs.copyFileSync(from, path.join(OUT, dest));
    }
  }

  await browser.close();
  console.log('Artifacts:', fs.readdirSync(OUT).join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
