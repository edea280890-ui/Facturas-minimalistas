# Re-auditoría QA — Calculadora Indexada al Dólar (post-hotfix)

**Rol:** Agente QA  
**Solicitado por:** Orquestador  
**Prototipo:** `docs/prototypes/calculadora-indexada-dolar.html`  
**Commit Frontend auditado:** `61701bf` (`fix(frontend): redondeo a centavos y BUG-001 overflow 320px`)  
**Alcance exclusivo:** (1) scroll horizontal @ 320px · (2) export html2canvas móvil  
**Fecha:** 2026-07-18  

---

## Aprobación de Calidad

**APROBACIÓN DE CALIDAD OTORGADA**

El Orquestador puede habilitar la programación del módulo de cobro respecto a estos dos criterios de bloqueo previos.

---

## 1. Scroll horizontal en 320px

| Métrica | Valor |
|---|---|
| `window.innerWidth` | 320 |
| `documentElement.scrollWidth` | **320** |
| `body.scrollWidth` | **320** |
| Elementos con `right > viewport` | **0** |
| `#voucher` width | 254px (`min(360px, 100%)`) |
| `box-sizing` | `border-box` |

**Resultado: PASS** — el desbordamiento horizontal (BUG-001) desapareció por completo, incluso con contenido extremo (email largo, concepto largo, total ~1.53e9).

Artefacto: `docs/qa/artifacts/reaudit-screen-320-full.png`

---

## 2. Export html2canvas desde pantalla móvil pequeña

### Procedimiento

- Viewport 320×700, `deviceScaleFactor: 2`
- Datos stress (montos grandes, email largo, concepto largo)
- Misma config de producción: `html2canvas(#voucher, { scale: 2, backgroundColor: '#FFFFFF' })`

### Resultados

| Check | Resultado |
|---|---|
| PNG generado | **508×1316** (≈ nodo 254×657.5 × scale 2) |
| Texto DOM completo en voucher | PASS (`REC-2026-00042`, emisor, receptor, email, concepto, total, nota) |
| Recorte en borde | PASS (`marginRightText = 51px`, `edgeDark = 0`) |
| `overflow-wrap` activo | PASS (`anywhere` / `break-word`) |
| Legibilidad visual del PNG | **PASS** — título, montos, email multilinea y TOTAL legibles; wrap natural sin cortes anómalos ni solapamientos |

Artefacto: `docs/qa/artifacts/reaudit-voucher-export-320.png`

### Nota metodológica

Un heurístico automático de “short pixel runs” marcó ratio alto (0.664); se descartó como **falso negativo** típico de anti-aliasing de tipografía. La inspección visual del PNG es la evidencia decisoria para legibilidad.

---

## Veredicto para el Orquestador

| Criterio | Estado |
|---|---|
| Sin scroll horizontal @ 320px | ✅ Cumple |
| Export móvil legible, sin cortes por `overflow-wrap`, calidad adecuada (scale 2) | ✅ Cumple |
| **Aprobación de Calidad** | ✅ **OTORGADA** |

Queda habilitado avanzar con la programación del módulo de cobro en lo que respecta a estos bloqueos de QA del prototipo.
