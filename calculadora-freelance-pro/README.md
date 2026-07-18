# Calculadora Freelance PRO

PWA de un solo archivo (`index.html`) para freelancers que cotizan en USD y cobran en ARS indexado al dólar, con voucher exportable y paywall Premium.

**Estado:** READY FOR LAUNCH (auditoría QA T5 aprobada).

---

## 🔐 Cambiar la clave de venta (obligatorio antes de desplegar)

1. Abrí `index.html`.
2. Buscá (Ctrl/Cmd+F): **`CLAVE_SECRETA_VENTA`**.
3. Reemplazá el valor de prueba:

```js
const CLAVE_SECRETA_VENTA = 'PRO-2026'; // ← cambiá esto
```

por tu clave definitiva, por ejemplo:

```js
const CLAVE_SECRETA_VENTA = 'PRO-TU-CLAVE-DEFINITIVA';
```

> **Importante:** la clave vive en el HTML del cliente. Cualquiera puede verla en “Ver código fuente”. Sirve como fricción comercial del MVP, no como seguridad criptográfica. A futuro: validación server-side.

---

## Despliegue en Netlify Drop

1. Cambiá `CLAVE_SECRETA_VENTA`.
2. Arrastrá la carpeta `calculadora-freelance-pro/` (o solo `index.html`) a [Netlify Drop](https://app.netlify.com/drop).
3. Probá en la URL generada: exportar → modal → ingresar tu clave → descarga PNG.

No hace falta `package.json`, build ni variables de entorno para este MVP.

### Dependencias externas (requieren internet)

| Recurso | URL |
|---|---|
| Tailwind CDN | `https://cdn.tailwindcss.com` |
| Google Fonts | `fonts.googleapis.com` / `fonts.gstatic.com` |
| html2canvas | `cdn.jsdelivr.net/npm/html2canvas@1.4.1/...` |
| Cotización | `https://dolarapi.com/v1/dolares/...` |

No hay assets relativos rotos: todo el UI está en `index.html`.

---

## Probar localmente en Cursor

### Opción A — Live Preview / Simple Browser
1. Abrí `calculadora-freelance-pro/index.html`.
2. Click derecho → **Open with Live Server** (si tenés la extensión) o Preview.
3. En DevTools → Application → Local Storage: borrá `calculadora_freelance_pro_license` para re-probar el paywall.

### Opción B — Servidor estático en terminal

```bash
cd calculadora-freelance-pro
python3 -m http.server 5173
```

Abrí `http://localhost:5173` en el navegador.

### Checklist rápido pre-deploy

- [ ] Cotización Blue/Oficial carga (o fallback manual a los 3s)
- [ ] Preview del voucher se actualiza al tipear
- [ ] Sin licencia → Exportar abre modal ($ 25.000 ARS)
- [ ] Con tu `CLAVE_SECRETA_VENTA` → descarga PNG
- [ ] Recargar la página → sigue pudiendo exportar
- [ ] Viewport ~320px: sin scroll horizontal

---

## Estructura del código (para escalar)

El JS dentro de `index.html` está separado por bloques comentados:

| Bloque | Responsabilidad |
|---|---|
| `CONFIG` | API, timeout, **`CLAVE_SECRETA_VENTA`**, storage key, precio |
| `DOM refs` | Mapa de elementos |
| `Formato / utilidades` | `formatUsd`, `formatLocal`, fechas, toast |
| `Cotización DolarAPI` | fetch + fallback manual |
| `Calculadora + preview` | `syncPreview`, redondeo a centavos |
| `Monetización T5` | paywall, licencia, localStorage |
| `Export PNG` | html2canvas |
| `BOOT` | listeners |

### Próximos pasos de escala (serie de apps)

1. Extraer módulos a `/js/config.js`, `/js/rates.js`, `/js/paywall.js`, `/js/export.js` (mismo patrón en cada app).
2. Compartir un design system (tokens CSS) entre productos.
3. Sustituir Tailwind CDN por build (`tailwindcli`) cuando haya dominio propio.
4. Añadir `manifest.webmanifest` + service worker para PWA instalable offline-light.
5. Backend de licencias (Supabase/Stripe/Hotmart) cuando el volumen lo justifique.

---

## Precio Premium (UI)

Mostrado en el modal: **$ 25.000 ARS** (constante de copy `PREMIUM_PRICE_LABEL` / markup del modal).
