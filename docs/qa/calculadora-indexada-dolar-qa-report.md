# Reporte QA — Calculadora Indexada al Dólar (PR #13)

**Rol:** Agente QA  
**Alcance auditado:** `docs/prototypes/calculadora-indexada-dolar.html`  
**Commit:** `8327a45` (branch `cursor/calculadora-dolar-frontend-6b13`)  
**Método:** Chrome headless (Puppeteer) + interceptación de red + captura html2canvas  
**Fecha:** 2026-07-18  

**Veredicto:** No se otorga Aprobación de Calidad. Hay **1 bug bloqueante de layout móvil** y **1 riesgo menor de redondeo** a corregir antes de monetizar.

---

## Resumen ejecutivo

| # | Escenario exigido por el Orquestador | Resultado |
|---|---|---|
| 1 | Error de red / timeout API (3s) | **PASS** |
| 2 | Formato montos grandes y decimales (moneda local) | **PASS** (con WARN) |
| 3 | Export `#voucher` con html2canvas en pantalla pequeña sin cortar texto | **PASS parcial** — el PNG no corta texto; el preview provoca overflow horizontal |

Artefactos:

- `docs/qa/artifacts/voucher-full-320.png` — export html2canvas @ viewport 320px  
- `docs/qa/artifacts/screen-full-320.png` — screenshot full-page 320px  
- `docs/qa/artifacts/qa-summary.json` — corrida automatizada  

---

## 1. Timeout / error de red (DolarAPI)

### Procedimiento

1. Interceptar `https://dolarapi.com/*` y **no responder** (request colgada).  
2. Medir tiempo hasta UI de fallback.  
3. Caso aparte: responder `503` inmediato.

### Resultados observados

| Check | Evidencia |
|---|---|
| Timing ~3s | Fallback en **3237–3270 ms** |
| Input manual | `#tipoCambio` pasa a `disabled=false` |
| Mensaje timeout | `Timeout de 3s. Ingresá el tipo de cambio manualmente.` |
| Badge / source | `tcSource = Manual`, badge `TC · manual` |
| Sync post-fallback | Con TC manual `1500.25` × USD `100` → live y voucher = `$ 150.025,00` |
| HTTP 503 | Mensaje `Falló DolarAPI. Ingresá el tipo de cambio manualmente.` |

### Conclusión

El fallback de 3 segundos funciona como especifica el Orquestador. No se reportan bugs en este eje.

---

## 2. Formato de montos grandes y decimales

### Casos ejecutados (live total ≡ voucher)

| Caso | USD | TC | Moneda | Total mostrado |
|---|---|---|---|---|
| Decimales | 0.99 | 1530.55 | ARS | `$ 1.515,24` |
| Grande | 999999.99 | 1530.5 | ARS | `$ 1.530.499.984,70` |
| Muy grande | 1234567.89 | 1500 | ARS | `$ 1.851.851.835,00` |
| MXN | 100.50 | 17.25 | MXN | `MXN 1.733,63` |
| TC 4 dec | 10.125 | 1000.3333 | ARS | `$ 10.128,37` |

Observaciones:

- Separadores `es-AR` correctos en total local (`.` miles, `,` decimal).  
- USD se formatea en `en-US` (`$999,999.99`) — intencional y consistente en UI + voucher.  
- Live total y `#vTotal` permanecen sincronizados.

### WARN — `FMT-no-cent-rounding` (no bloqueante)

```js
const total = monto * tc; // IEEE-754, sin Math.round a centavos
```

En el caso `999999.99 × 1530.5`, el raw JS es `1530499984.695` y `Intl` muestra `,70` (redondeo de display aceptable). Antes de monetizar cobros reales, Frontend debería redondear a centavos de forma explícita, p. ej.:

```js
const total = Math.round(monto * tc * 100) / 100;
```

### Conclusión

Formato visual: **PASS**. Riesgo financiero de off-by-one centavo: **WARN** para corrección preventiva.

---

## 3. Export html2canvas en pantallas pequeñas

### Procedimiento

- Viewport **320×700** (deviceScaleFactor 2).  
- Datos extremos: monto ~1e6 USD, email largo, concepto largo, total > 1.5e9.  
- Export con la misma config del prototipo (`scale: 2`, `backgroundColor: #FFFFFF`).

### Lo que funciona

| Check | Evidencia |
|---|---|
| html2canvas genera PNG | `720×1118` (≈ nodo × 2) |
| Texto del TOTAL no recortado en PNG | `marginRightText = 51px`, `nearEdgeDark = 0` |
| Concepto multilinea | height DOM ≈ 37.7px |
| Email largo envuelve | overflowX DOM = 0, height ≈ 33.8px |
| Sync form → voucher | `REC-2026-00042`, emisor/receptor/nota presentes en DOM del voucher |

### BUG-001 (bloqueante) — Overflow horizontal en viewport ≤ 360px

**Severidad:** Alta (rompe “pantalla pequeña” / PWA móvil)  
**Repro:** Abrir el HTML con ancho 320px (o DevTools iPhone SE).  

**Medición:**

```
viewport: 320
voucherW: 360
document.scrollWidth: 410
horizontalOverflow: true
```

**Causa raíz:**

```css
#voucher {
  width: 360px;
  max-width: 100%; /* no frena: el padre crece con el hijo */
}
```

El contenedor padre (área dashed) se expande al min-content del voucher (360px) + paddings → la página hace scroll horizontal. `max-width: 100%` no limita porque el % se resuelve contra un padre ya ensanchado.

**Impacto en export:** el PNG captura el voucher a 360px y **no corta texto**. El fallo es de **layout/preview móvil**, no de recorte interno del canvas. Aun así bloquea la experiencia PWA en pantallas chicas (y puede confundir QA visual del export “en contexto”).

**Fix sugerido para Frontend:**

```css
/* Contenedor de la Zona B */
.voucher-stage {
  width: 100%;
  max-width: 100%;
  overflow-x: auto; /* o better: evitar overflow */
  box-sizing: border-box;
}
#voucher {
  width: 360px;
  max-width: 100%;
  box-sizing: border-box;
}
```

Y asegurar que el stage/padre tenga ancho acotado al viewport, p. ej. `min-width: 0` en el grid item + `width: 100%` en el stage:

```css
main > section { min-width: 0; }
.voucher-stage { width: 100%; max-width: 100%; }
#voucher { width: min(360px, 100%); box-sizing: border-box; }
```

Opcional export-safe: antes de `html2canvas`, clonar `#voucher` offscreen a 360px fijos para un PNG siempre nítido e independiente del ancho responsive.

### WARN — `EXPORT-CSS-WRAP`

El CSS de `#voucher` no declara `overflow-wrap` / `word-break`. En Chromium el email largo envolvió bien; conviene endurecer:

```css
#voucher .v-value,
#voucher .v-note,
#voucher .v-total {
  overflow-wrap: anywhere;
  word-wrap: break-word;
}
```

### Hallazgo UX menor (no bloqueante)

En 320px el header trunca la marca (`Calculadora USD` / tagline) por competencia de espacio con badge + CTA. No afecta cálculo ni export.

---

## Matriz de hallazgos para Frontend

| ID | Severidad | Descripción | Acción |
|---|---|---|---|
| **BUG-001** | **Alta** | `#voucher` fijo 360px provoca `scrollWidth` 410 en viewport 320 | Acotar padre (`min-width:0`, `width:100%`) y usar `width: min(360px, 100%)` |
| **WARN-001** | Media | `total = monto * tc` sin redondeo a centavos | `Math.round(monto * tc * 100) / 100` |
| **WARN-002** | Baja | Sin `overflow-wrap` en textos del voucher | Añadir wrap explícito export-safe |

---

## Criterio de Aprobación de Calidad

Para otorgar **Aprobación de Calidad** se requiere:

1. ~~Timeout 3s + fallback manual~~ ✅  
2. ~~Formato grandes/decimales coherente en moneda local~~ ✅  
3. Corregir **BUG-001** (sin overflow horizontal ≤360px)  
4. (Recomendado) Aplicar **WARN-001** y **WARN-002**  

**Estado actual: RECHAZADO CONDICIONAL — pendiente fix BUG-001.**

Tras el fix, re-ejecutar viewport 320 y confirmar `document.documentElement.scrollWidth <= window.innerWidth + 1` y re-export PNG sin recorte de texto.
