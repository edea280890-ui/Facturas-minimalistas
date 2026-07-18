# Calculadora Indexada al Dólar (PWA) — Especificación UI/UX

**Rol:** Agente UI/UX  
**Alcance:** Una sola pantalla · Público B2B / Freelancer profesional  
**Regla del Orquestador:** El Voucher debe ser minimalista y usar CSS básico para exportación fiable a imagen.

---

## 1. Paleta de colores y tipografías

### Dirección visual

Look **fintech sobrio**: confianza, claridad numérica y contraste alto en montos. Sin púrpura, sin crema+terracota, sin estética “newspaper”, sin dark mode por defecto, sin glows ni pills decorativas.

### Tokens de color (UI / shell de la app)

| Token | Hex | Uso |
|---|---|---|
| `--ink` | `#0B1220` | Texto principal, títulos, montos clave |
| `--ink-muted` | `#475569` | Labels, ayuda, metadatos |
| `--ink-faint` | `#94A3B8` | Placeholders, hints secundarios |
| `--surface` | `#F4F7FA` | Fondo de página (base) |
| `--surface-elevated` | `#FFFFFF` | Panel de carga de datos |
| `--line` | `#D8E0EA` | Bordes, divisores |
| `--accent` | `#0F6E56` | CTA primario, foco, acento “valor” |
| `--accent-hover` | `#0B5A46` | Hover / pressed del CTA |
| `--accent-soft` | `#E6F4EF` | Fondo sutil de estados activos / foco |
| `--warning` | `#B45309` | Alertas de tipo de cambio desactualizado |
| `--danger` | `#B91C1C` | Errores de validación |
| `--usd` | `#1D4E89` | Etiqueta / chip de moneda USD (solo UI, no voucher) |
| `--ars` / local | `#334155` | Etiqueta moneda local (solo UI) |

**Atmósfera del fondo (solo shell, nunca dentro del voucher):**

```css
background:
  radial-gradient(1200px 600px at 10% -10%, #E8F2EC 0%, transparent 55%),
  radial-gradient(900px 500px at 100% 0%, #E7EEF8 0%, transparent 50%),
  var(--surface);
```

### Tokens de color (Voucher — subset seguro para export)

El voucher **no** usa gradientes, sombras, `backdrop-filter`, `mix-blend-mode` ni colores con alpha complejos.

| Token voucher | Hex | Uso |
|---|---|---|
| `--v-bg` | `#FFFFFF` | Fondo del comprobante |
| `--v-text` | `#111827` | Texto body |
| `--v-heading` | `#0B1220` | Título / totales |
| `--v-muted` | `#6B7280` | Labels y notas |
| `--v-line` | `#E5E7EB` | Reglas horizontales 1px |
| `--v-accent` | `#0F6E56` | Una sola barra superior de 4px (identidad mínima) |

### Tipografías

#### Shell de la app (UI interactiva)

| Rol | Familia | Fallback | Notas |
|---|---|---|---|
| UI / labels | **Plus Jakarta Sans** | `system-ui, sans-serif` | Profesional, legible en formularios |
| Display corto (marca / título pantalla) | **Plus Jakarta Sans** SemiBold/Bold | idem | La marca es señal hero; no competir con un serif ornamental |
| Números / tipos de cambio | **IBM Plex Mono** | `ui-monospace, monospace` | Tabular figures (`font-variant-numeric: tabular-nums`) |

Cargas sugeridas (Google Fonts o self-host):

- `Plus Jakarta Sans` — 400, 500, 600, 700  
- `IBM Plex Mono` — 400, 500, 600  

#### Voucher (export a imagen)

Usar **solo tipografías del sistema** para evitar fallos de captura (`html2canvas` / `dom-to-image` / similar):

```css
font-family: Arial, Helvetica, sans-serif;
```

- Títulos voucher: `Arial, Helvetica, sans-serif` · 16–18px · `font-weight: 700`  
- Body: 12–13px · `font-weight: 400`  
- Montos: mismo stack + `font-variant-numeric: tabular-nums` (si el motor lo respeta; si no, monoespacio del sistema: `"Courier New", Courier, monospace` solo en montos)

### Escala tipográfica (UI)

| Elemento | Tamaño | Peso |
|---|---|---|
| Marca (header app) | 22–28px | 700 |
| Título de zona | 13px uppercase tracking | 600 |
| Label de campo | 12–13px | 500 |
| Input value | 16px | 500 |
| Resultado destacado (UI) | 28–32px | 700 · mono |
| Texto ayuda | 12px | 400 |
| Voucher título | 18px | 700 |
| Voucher monto total | 22px | 700 |

---

## 2. Distribución de la interfaz (wireframe descriptivo)

### Principio de una sola pantalla

Una composición: **cargar datos → ver voucher → exportar**.  
Sin dashboard, sin stats strip, sin cards decorativas. Los únicos contenedores con borde/fondo son: (a) el panel de formulario (interacción) y (b) el lienzo del voucher (preview exportable).

### Layout desktop (≥ 960px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER (compacto, 56–64px)                                              │
│  [Marca: Calculadora USD]          [Tipo de cambio · fecha]  [Exportar]  │
├─────────────────────────────────┬────────────────────────────────────────┤
│                                 │                                        │
│  ZONA A — CARGA DE DATOS        │  ZONA B — PREVISUALIZACIÓN VOUCHER     │
│  (Calculadora)                  │                                        │
│  width ~42% · padding 24–32     │  width ~58% · padding 24 · centered    │
│                                 │                                        │
│  ┌───────────────────────────┐  │         ┌────────────────────┐         │
│  │ Concepto / descripción    │  │         │ ##### accent bar   │         │
│  │ [_____________________]   │  │         │ VOUCHER / RECIBO   │         │
│  │                           │  │         │                    │         │
│  │ Monto en USD              │  │         │ Emisor ……          │         │
│  │ [  1,250.00  ]            │  │         │ Receptor ……        │         │
│  │                           │  │         │ ───────────────    │         │
│  │ Tipo de cambio (USD→LOC)  │  │         │ Concepto           │         │
│  │ [  1,025.50  ]  [auto?]   │  │         │ USD ……             │         │
│  │                           │  │         │ TC ……              │         │
│  │ Moneda local              │  │         │ Local ……           │         │
│  │ [ ARS ▾ ]                 │  │         │ ───────────────    │         │
│  │                           │  │         │ TOTAL LOCAL         │         │
│  │ Datos del emisor          │  │         │ Fecha / nota       │         │
│  │ [ Nombre ] [ ID/CUIT ]    │  │         └────────────────────┘         │
│  │                           │  │                                        │
│  │ Datos del receptor        │  │  Acciones bajo el lienzo:              │
│  │ [ Nombre ] [ Email opt. ] │  │  [ Descargar imagen ]  [ Copiar ]      │
│  │                           │  │                                        │
│  │ Resultado vivo (UI)       │  │  Nota: el lienzo es el ÚNICO nodo      │
│  │ ≈ 1.281.875 ARS           │  │  capturado para export (#voucher).     │
│  └───────────────────────────┘  │                                        │
│                                 │                                        │
└─────────────────────────────────┴────────────────────────────────────────┘
```

### Layout mobile (< 960px)

```
┌────────────────────────────┐
│ HEADER: Marca + Exportar   │
├────────────────────────────┤
│ ZONA A — CARGA DE DATOS    │  ← primero (tarea primaria)
│ (formulario completo)      │
├────────────────────────────┤
│ ZONA B — VOUCHER PREVIEW   │  ← segundo, scroll natural
│ (lienzo a ancho completo   │
│  con max-width ~360–400)   │
│ [ Descargar imagen ]       │  ← sticky bottom opcional
└────────────────────────────┘
```

---

### Zona A — Carga de datos (Calculadora)

**Propósito único:** ingresar/editar inputs que alimentan el cálculo y el voucher.

**Orden de campos (arriba → abajo):**

1. **Concepto** — texto corto del servicio/producto  
2. **Monto USD** — input numérico, formato al blur (`1,250.00`)  
3. **Tipo de cambio** — input numérico + indicador de fuente (`Manual` / `API · HH:mm`)  
4. **Moneda local** — select compacto (ARS, MXN, COP, CLP, UYU, etc.)  
5. **Emisor** — nombre + identificador fiscal opcional  
6. **Receptor** — nombre + email opcional  
7. **Fecha del comprobante** — default hoy  
8. **Nota opcional** — 1 línea (ej. “Cotización BCRA vendedor”)

**Resultado vivo (solo UI, no va al export como bloque aparte):**  
Debajo del form, una línea tipográfica grande en mono:

`Total local = Monto USD × TC` → **`1.281.875,00 ARS`**

**Estados de campo:**

- Default: borde `--line`, fondo blanco  
- Focus: borde `--accent`, ring suave `--accent-soft`  
- Error: borde `--danger`, mensaje 12px debajo  
- Sin cards anidadas: un solo panel blanco con separación por espacio vertical (16–20px), no cajas internas

**CTA en header (desktop) / sticky (mobile):**  
`Exportar imagen` — usa `--accent`. Es la única acción primaria de la pantalla.

---

### Zona B — Previsualización del Voucher

**Propósito único:** mostrar el comprobante tal como se exportará.

#### Estructura interna del voucher (minimalista)

```
┌──────────────────────────────────┐
│████ 4px accent bar (sólido) ████ │
│                                  │
│  COMPROBANTE / RECIBO            │  ← 18px bold
│  N° opcional · Fecha             │  ← 12px muted
│                                  │
│  Emisor                          │  ← label 11px muted
│  Nombre del emisor               │
│  ID fiscal (si hay)              │
│                                  │
│  Receptor                        │
│  Nombre del receptor             │
│                                  │
│  ──────────────────────────────  │  ← 1px solid #E5E7EB
│                                  │
│  Concepto                        │
│  Descripción del servicio        │
│                                  │
│  Monto USD          USD 1,250.00 │  ← fila label | valor
│  Tipo de cambio      1,025.50    │
│  Moneda                        ARS│
│                                  │
│  ──────────────────────────────  │
│                                  │
│  TOTAL              ARS 1.281.875 │  ← 22px bold
│                                  │
│  Nota (si existe)                │  ← 11px muted
└──────────────────────────────────┘
```

Tamaño objetivo del lienzo: **360×520px** aprox. (o `width: 360px; padding: 24px`), fondo blanco sólido. Centrado en la Zona B sobre un área `--surface` (el área gris **no** se captura).

#### CSS permitido en el voucher (obligatorio para el agente de front)

Solo CSS “aburrido” y predecible:

- `display: block` / `table` / filas con `display: flex` simple  
- `padding`, `margin`, `width`, `max-width`  
- `border` / `border-bottom: 1px solid`  
- `color`, `background` **sólidos** (hex opacos)  
- `font-family: Arial, Helvetica, sans-serif`  
- `font-size`, `font-weight`, `line-height`, `text-align`  
- `letter-spacing` leve en el título  

**Prohibido dentro de `#voucher` (nodo exportado):**

- Gradientes, `box-shadow`, `text-shadow`, `filter`, `backdrop-filter`  
- `mix-blend-mode`, `opacity` < 1 en textos críticos  
- `transform`, `position: sticky/fixed`, animaciones  
- Iconos SVG complejos, emojis, badges flotantes  
- Fuentes web custom (cargar Arial/Helvetica del sistema)  
- `gap` excesivo en flex antiguos (preferir `margin` en hijos si se apunta a capturas legacy)  
- Border-radius > 0 en el lienzo (esquinas rectas = captura más limpia)  
- Overflow oculto con contenido cortado  

El botón **Descargar imagen** vive **fuera** de `#voucher`.

---

## 3. Jerarquía de la primera viewport (desktop)

Contenido permitido en el primer viewport:

1. Marca (`Calculadora USD` o nombre de producto) — señal hero  
2. Una línea de soporte: “Convertí y documentá cobros indexados al dólar”  
3. Zona A (formulario) + Zona B (voucher)  
4. Un grupo de CTA: Exportar  

No incluir en el primer viewport: stats, pricing, listados, promos, chips decorativos sobre el voucher.

---

## 4. Motion (solo shell; 2–3 intenciones)

1. **Reveal del total local** — fade/slide 120–160ms al recalcular  
2. **Focus ring** de inputs — transición de borde 120ms  
3. **Feedback de export** — toast/check breve tras descarga  

Sin motion en el voucher.

---

## 5. Entregables para el agente de implementación

- Aplicar tokens en `:root` del shell.  
- Layout split 42/58 desktop; stack mobile.  
- Formulario = Zona A; `#voucher` = Zona B exportable.  
- Librería de captura apuntando **solo** a `#voucher`.  
- Cumplir lista de CSS permitido/prohibido del voucher.

---

## 6. Checklist de aceptación UI/UX

- [ ] Paleta B2B aplicada (ink + teal, sin púrpura/crema cliché)  
- [ ] Tipografía UI (Jakarta) + mono para números; voucher en Arial/Helvetica  
- [ ] Una sola pantalla con zonas A/B definidas  
- [ ] Voucher minimalista, sin sombras/gradientes/fuentes web  
- [ ] Export a imagen captura únicamente el lienzo del voucher  
- [ ] Marca visible como señal principal en header  
- [ ] Mobile: formulario primero, voucher después, CTA alcanzable  
