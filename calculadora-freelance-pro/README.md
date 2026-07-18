# Calculadora Freelance PRO

PWA de un solo archivo (`index.html`) — Tailwind CDN · Vanilla JS · html2canvas.

**Estado:** READY FOR LAUNCH (MVP auditado).

---

## 🔐 Cambiar la clave de venta (obligatorio)

1. Abrí `index.html`.
2. Buscá: **`CLAVE_SECRETA_VENTA`** (bloque `CONFIG`, ~línea con comentario 🔐).
3. Reemplazá:

```js
const CLAVE_SECRETA_VENTA = 'PRO-2026';
```

por tu clave definitiva.

Storage: `localStorage['calculadora_usd_license']`.

> La clave es visible en el HTML del cliente. Sirve como fricción comercial del MVP, no como seguridad fuerte.

### Link de cobro Mercado Pago

Buscá **`LINK_MERCADO_PAGO`** en `index.html` (bloque `CONFIG`) y pegá tu link de pago:

```js
const LINK_MERCADO_PAGO = 'https://mpago.la/tu-link';
```

Ese link se abre desde el botón **Adquirir Licencia aquí** del modal Paywall.

---

## Netlify Drop

1. Cambiá `CLAVE_SECRETA_VENTA` y `LINK_MERCADO_PAGO`.
2. Arrastrá esta carpeta (o solo `index.html`) a [Netlify Drop](https://app.netlify.com/drop).
3. Probá: Exportar → modal → tu clave → Descargar PNG.

### Dependencias externas (online)

| Recurso | URL |
|---|---|
| Tailwind | `cdn.tailwindcss.com` |
| Fonts | `fonts.googleapis.com` |
| html2canvas | `cdnjs.cloudflare.com/.../html2canvas.min.js` |
| Cotización global | `api.exchangerate-api.com/v4/latest/{BASE}` → ARS |

No hay links relativos rotos.

---

## Probar en Cursor

```bash
cd calculadora-freelance-pro
python3 -m http.server 5173
```

Abrí `http://localhost:5173`.

Para resetear licencia: DevTools → Application → Local Storage → borrá `calculadora_usd_license`.

---

## Módulos (escala futura)

| Bloque | Función |
|---|---|
| `CONFIG` | `CLAVE_SECRETA_VENTA`, API, timeout, storage |
| Cotización | `fetchCotizacion` |
| Calculadora | `syncPreview` |
| T5 Paywall | `handleExportClick` / `validateLicense` |
| Export | `processExport` (html2canvas) |
| `window.App` | API pública para el HTML |

Próximo paso de escala: extraer a `/js/config.js`, `/js/rates.js`, `/js/paywall.js`, `/js/export.js` y reutilizar el mismo patrón en la serie de apps.
