# Sprint 3 — Filtros avanzados, UX gamer, i18n y Card Tooltip

## Qué se construyó

Sprint 3 tuvo cuatro ejes:

1. **Filtros avanzados**: 6 filtros simultáneos (attribute, race, level, archetype, atk, def) con archetype consumido desde la API real como dropdown.
2. **UX gamer**: FilterBar estilo HUD, vista galería/lista intercambiable, debounce, cancelación de requests, persistencia de estado en URL.
3. **Internacionalización (i18n)**: toda la app traducida a ES/EN con selector de idioma persistido en localStorage.
4. **Card Tooltip**: panel flotante al hover con imagen, descripción completa, stats y precio.

---

## Archivos creados o modificados

### Nuevos
| Archivo | Propósito |
|---|---|
| `src/features/catalog/constants.ts` | Listas estáticas: ATTRIBUTES, MONSTER_RACES, SPELL_TRAP_RACES, LEVELS |
| `src/features/catalog/hooks/useCatalogFilters.ts` | Estado de filtros en URL via useSearchParams |
| `src/features/catalog/hooks/useArchetypes.ts` | Fetch de arquetipos desde `/api/v1/archetypes` |
| `src/features/catalog/components/FilterBar.tsx` | HUD de 6 filtros |
| `src/features/catalog/components/FilterBar.module.css` | Estilos gamer del HUD |
| `src/features/catalog/components/ViewToggle.tsx` | Botón galería/lista |
| `src/features/catalog/components/ViewToggle.module.css` | Estilos del toggle |
| `src/features/catalog/components/CardListItem.tsx` | Fila individual en vista lista |
| `src/features/catalog/components/CardListItem.module.css` | Estilos de la fila |
| `src/features/catalog/components/CardListView.tsx` | Contenedor de lista |
| `src/i18n/config.ts` | Inicialización de i18next |
| `src/i18n/locales/en.json` | Traducciones inglés |
| `src/i18n/locales/es.json` | Traducciones español |
| `src/components/layout/LanguageToggle.tsx` | Botón ES/EN en navbar |
| `src/components/layout/LanguageToggle.module.css` | Estilo del botón |
| `src/features/catalog/components/CardTooltip.tsx` | Panel flotante al hover con info completa |
| `src/features/catalog/components/CardTooltip.module.css` | Estilos del panel (HUD, glassmorphism dark) |

### Modificados
| Archivo | Cambio principal |
|---|---|
| `src/features/catalog/types.ts` | Agregado CatalogFilters, RawArchetypesResponse |
| `src/features/catalog/api.ts` | Agregado fetchArchetypes(), AbortSignal en fetchCards() |
| `src/features/catalog/hooks/useCards.ts` | Debounce por tipo de input, archetype sin debounce |
| `src/features/catalog/constants.ts` | Exportado ATTRIBUTE_COLOR (centralizado, antes duplicado) |
| `src/features/catalog/components/FilterBar.tsx` | i18n + archetype como select |
| `src/features/catalog/components/CardTile.tsx` | Hover handlers + createPortal → CardTooltip |
| `src/features/catalog/components/CardListItem.tsx` | Hover handlers + createPortal → CardTooltip |
| `src/features/catalog/components/SearchBar.tsx` | i18n |
| `src/features/catalog/components/Pagination.tsx` | i18n |
| `src/pages/CatalogPage.tsx` | Conecta todos los nuevos hooks y componentes, i18n |
| `src/pages/HomePage.tsx` | i18n |
| `src/pages/PlaceholderPage.tsx` | Recibe titleKey, usa i18n |
| `src/router.tsx` | Pasa titleKey a PlaceholderPage |
| `src/components/layout/Navbar.tsx` | i18n + LanguageToggle |
| `src/components/ui/LoadingSpinner.tsx` | i18n para label por defecto |
| `src/components/ui/ErrorMessage.tsx` | i18n para defaults y botón |
| `src/components/ui/EmptyState.tsx` | i18n para defaults |
| `src/main.tsx` | Import de i18n/config |

---

## Cómo probarlo

### Arrancar el servidor de desarrollo

```bash
cd apps/web
npm run dev
# Abre http://localhost:5173/catalog
```

### Checklist de pruebas manuales

**Filtros**
- [ ] Seleccionar "DARK" en Attribute → solo cartas DARK
- [ ] Seleccionar "Dragon" en Race → solo dragones
- [ ] Seleccionar nivel "7" → solo cartas de nivel 7
- [ ] Abrir Archetype dropdown → debe cargar la lista desde la API (puede tardar un momento la primera vez)
- [ ] Seleccionar "Blue-Eyes" en Archetype → cartas de Blue-Eyes
- [ ] Escribir "2500" en ATK → cartas con exactamente 2500 ATK
- [ ] Combinar 3 filtros a la vez → deben aplicarse todos simultáneamente
- [ ] El badge "N filtros activos" debe aparecer y contar correctamente
- [ ] El botón "Clear filters" debe resetear todo

**URL persistence**
- [ ] Aplicar filtros → copiar la URL y pegarla en una pestaña nueva → los filtros deben restaurarse
- [ ] Hacer F5 con filtros activos → los filtros deben mantenerse

**Debounce**
- [ ] Escribir rápido en el search bar → solo debe disparar la request cuando dejes de escribir (400ms)
- [ ] Abrir Network tab del browser → verificar que no hay una request por cada tecla presionada

**Cancellation**
- [ ] Escribir rápido y cambiar el texto → en Network tab, los requests anteriores deben aparecer como "cancelled"

**Card Tooltip**
- [ ] Colocar el cursor sobre una carta en vista galería y esperar → debe aparecer panel flotante después de ~300ms
- [ ] El panel muestra: imagen, nombre, atributo + nivel, [raza / tipo], descripción completa, ATK/DEF, precio
- [ ] Mover el cursor fuera de la carta → el panel desaparece inmediatamente
- [ ] Pasar el cursor rápido por varias cartas → el panel no debe parpadear (delay de 300ms lo evita)
- [ ] Hover en carta en el borde DERECHO del viewport → el panel debe aparecer a la IZQUIERDA de la carta
- [ ] Hover en carta en el borde IZQUIERDO del viewport → el panel debe aparecer a la DERECHA
- [ ] Hover en carta en vista lista → funciona igual que en galería
- [ ] Cambiar idioma a EN → labels del tooltip en inglés ("Market Price", "Archetype")

**Vista galería/lista**
- [ ] Hacer click en el ícono ⊞ → vista galería (tarjetas)
- [ ] Hacer click en el ícono ☰ → vista lista (filas)
- [ ] Paginar en vista lista → debe funcionar igual

**i18n**
- [ ] Hacer click en el botón "EN" en el navbar → toda la interfaz cambia a inglés
- [ ] Hacer click en "ES" → vuelve a español
- [ ] Cambiar a inglés, hacer F5 → debe mantener inglés (persiste en localStorage)
- [ ] Abrir DevTools → Application → Local Storage → verificar clave `i18nextLng`

---

## Guía educativa: lo que aprendimos en este sprint

---

### 1. Estado en la URL con `useSearchParams`

#### El problema que resuelve

¿Alguna vez usaste una app y al hacer F5 perdiste todo lo que habías filtrado? Eso pasa cuando el estado vive en la memoria del componente con `useState`. Cuando refrescas, React "muere y renace" y el estado empieza vacío.

La URL, en cambio, persiste. Y además es compartible: podés enviarle la URL exacta a alguien y verá los mismos resultados.

#### Cómo funciona `useSearchParams`

```
URL: /catalog?attribute=DARK&race=Dragon&level=7
```

```typescript
import { useSearchParams } from 'react-router-dom'

function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Leer un valor de la URL (igual que leer un input)
  const attribute = searchParams.get('attribute') ?? ''

  // Escribir un valor en la URL
  function setFilter(key: string, value: string) {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)   // agrega ?key=value
        } else {
          next.delete(key)       // elimina el parámetro si está vacío
        }
        return next
      },
      { replace: true }   // no agrega entradas al historial del browser
    )
  }
}
```

#### ¿Por qué `replace: true`?

Sin `replace: true`, cada tecla que el usuario presiona agrega una entrada al historial. Después tendría que presionar Atrás 50 veces para salir de la página de catálogo. Con `replace: true` siempre reemplaza la última entrada.

#### Regla de oro

> **Si un filtro o estado necesita sobrevivir a un refresh o ser compartible, ponlo en la URL. Si es efímero (modal abierto, tooltip visible), ponlo en `useState`.**

---

### 2. Debounce: por qué no cada tecla dispara una request

#### El problema

Sin debounce, si el usuario escribe "Dragon" letra por letra:

```
D     → request a la API
Dr    → request a la API
Dra   → request a la API
Drag  → request a la API
Drago → request a la API
Dragon → request a la API
```

Seis requests innecesarios. El servidor recibe basura. La UX se ve nerviosa.

#### Qué es debounce

Debounce es esperar a que el usuario deje de escribir antes de ejecutar algo. Si el usuario sigue escribiendo dentro del plazo, el temporizador se reinicia.

```
D     → espera 400ms...
Dr    → cancela el timer anterior, espera 400ms...
Dra   → cancela el timer anterior, espera 400ms...
Dragon → cancela el timer anterior, espera 400ms...
[silencio por 400ms]
→ request a la API con "Dragon"
```

Un solo request. Perfecto.

#### La implementación: `useDebounce`

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Programa actualizar el valor después de `delay` ms
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: si `value` cambia antes de que pasen los `delay` ms,
    // cancela el timer anterior y empieza uno nuevo
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

La clave está en el `return () => clearTimeout(timer)`. Eso es la función de cleanup del `useEffect`. React la ejecuta automáticamente antes de correr el efecto de nuevo.

#### Cuándo usar debounce y cuándo no

| Tipo de input | Debounce | Por qué |
|---|---|---|
| Campo de texto (name search) | ✓ 400ms | El usuario escribe múltiples caracteres |
| Campo numérico (atk, def) | ✓ 600ms | El usuario incrementa/decrementa con flechas |
| Select dropdown | ✗ | El usuario elige un valor discreto, una sola acción |

```typescript
// useCards.ts
const debouncedName = useDebounce(filters.name, 400)  // texto: debounce
const debouncedAtk = useDebounce(filters.atk, 600)    // número: debounce
const { attribute, race, archetype } = filters         // selects: sin debounce
```

---

### 3. Cancelación de requests con AbortSignal

#### El problema: requests que llegan tarde

Imagina esta secuencia:

1. Usuario busca "Dark" → se lanza Request A
2. Antes de que A llegue, el usuario borra y escribe "Light" → se lanza Request B
3. Request B llega primero (era más rápida)
4. Request A llega después y sobreescribe los resultados con "Dark"

El usuario ve "Light" en el buscador pero "Dark" en los resultados. **Race condition**.

#### La solución: AbortController

```typescript
// Conceptualmente, esto es lo que pasa detrás de escena:

const controller = new AbortController()
const { signal } = controller

fetch('/api/cards?name=Dark', { signal })
  .then(data => mostrarResultados(data))

// Si el usuario cambia la búsqueda:
controller.abort()  // cancela el fetch en vuelo
// → el .then() nunca se ejecuta
```

#### Cómo TanStack Query lo hace automáticamente

TanStack Query maneja esto por vos. Solo tenés que pasar el `signal` al fetch:

```typescript
// useCards.ts
const query = useQuery({
  queryKey: ['cards', { name: debouncedName, attribute, ... }],
  queryFn: ({ signal }) =>
    fetchCards({ name: debouncedName, ... }, signal),
  //            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //            TanStack Query te pasa un signal que aborta
  //            automáticamente cuando queryKey cambia
})

// api.ts
export async function fetchCards(params, signal?: AbortSignal) {
  return axios.get('/cards', {
    params,
    signal,  // axios cancela el request si signal.aborted = true
  })
}
```

Cuando `queryKey` cambia (porque el usuario escribió otra cosa), TanStack Query aborta el request anterior antes de lanzar el nuevo.

#### Verificar en el browser

1. Abrí DevTools → Network tab
2. Escribí rápido en el buscador
3. Verás requests con estado `(cancelled)` — esos son los que fueron abortados

---

### 4. Datos de una API externa como fuente de un dropdown

#### El patrón: fetch → store en caché → render como `<select>`

Los arquetipos de YGO son datos reales de la API. En vez de hardcodearlos (como los atributos), los cargamos dinámicamente.

```
/api/v1/archetypes → ["A-Assault Core", "ABC", "Abe", ..., "ZW - Unicorn Spear"]
                               ↓
                      useArchetypes hook
                               ↓
                        string[] en caché
                               ↓
                    <select> con <option> por cada arquetipo
```

#### El shape de la respuesta de la API

```json
{
  "data": [
    { "type": "archetypes", "id": "Blue-Eyes", "attributes": {} },
    { "type": "archetypes", "id": "Dark Magician", "attributes": {} }
  ]
}
```

El `id` es el nombre del arquetipo. `attributes` está vacío (no tiene datos extra).

#### La implementación completa

```typescript
// types.ts
export interface RawArchetypesResponse {
  data: Array<{ type: 'archetypes'; id: string; attributes: Record<string, never> }>
}

// api.ts
export async function fetchArchetypes(): Promise<string[]> {
  const response = await ygoApiClient.get<RawArchetypesResponse>('/archetypes')
  return response.data.data.map(item => item.id).sort()
  //                         ^^^^^^^^^^^^^^^^^^^^^^^^
  //                         extraemos solo el id y ordenamos alfabéticamente
}

// hooks/useArchetypes.ts
export function useArchetypes() {
  return useQuery({
    queryKey: ['archetypes'],
    queryFn: fetchArchetypes,
    staleTime: Infinity,  // los arquetipos casi nunca cambian
    //                       Infinity = nunca re-fetchar en background
  })
}

// FilterBar.tsx
function FilterBar({ archetypes, archetypesLoading }) {
  return (
    <select disabled={archetypesLoading}>
      <option value="">
        {archetypesLoading ? 'Loading...' : 'All'}
      </option>
      {archetypes.map(a => (
        <option key={a} value={a}>{a}</option>
      ))}
    </select>
  )
}
```

#### Por qué `staleTime: Infinity`

En el hook `useCards` usamos `staleTime: 1000 * 60 * 5` (5 minutos). ¿Por qué arquetipos usa `Infinity`?

- Los resultados de búsqueda cambian: los datos de las cartas se actualizan.
- La lista de arquetipos es estática: los arquetipos del juego cambian solo cuando sale una nueva expansión, no en tiempo real.

Con `Infinity`, TanStack Query nunca marca los datos como "stale" y nunca re-fetcha automáticamente. El usuario carga la lista una vez y se cachea para siempre (hasta que cierra el tab).

---

### 5. Internacionalización (i18n) con react-i18next

#### Qué es i18n

Internacionalización (abreviada i18n porque hay 18 letras entre la "i" y la "n") es el proceso de preparar una app para múltiples idiomas. No es solo traducir textos: también incluye formatos de fecha, moneda, plurales, y dirección de escritura (RTL/LTR).

En este proyecto: soporte ES/EN.

#### La arquitectura completa

```
i18n/
├── config.ts          ← Configura i18next una vez al arrancar la app
└── locales/
    ├── en.json        ← { "nav": { "catalog": "Catalog" }, ... }
    └── es.json        ← { "nav": { "catalog": "Catálogo" }, ... }
```

#### Los archivos de traducción

Son JSONs con estructura anidada por categoría:

```json
{
  "nav": {
    "catalog": "Catalog",
    "inventory": "Inventory"
  },
  "catalog": {
    "title": "Catalog",
    "subtitleCount": "{{count, number}} cards found",
    "filters": {
      "attribute": "Attribute",
      "all": "All"
    }
  },
  "pagination": {
    "showing": "{{from}}–{{to}} of {{total, number}} cards"
  }
}
```

Las dobles llaves `{{variable}}` son interpolaciones: `t('pagination.showing', { from: 1, to: 20, total: 5000 })` → `"1–20 of 5,000 cards"`.

La parte `, number` formatea el número según el locale del idioma activo (`5000` → `5,000` en inglés, `5.000` en español).

#### Configuración (config.ts)

```typescript
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'

void i18n
  .use(LanguageDetector)     // Paso 1: detecta idioma automáticamente
  .use(initReactI18next)     // Paso 2: integra con React (provee hook useTranslation)
  .init({
    resources: {
      en: { translation: en },  // registra las traducciones
      es: { translation: es },
    },
    fallbackLng: 'es',            // si no encuentra el idioma → usar español
    supportedLngs: ['es', 'en'],  // idiomas válidos
    interpolation: {
      escapeValue: false,  // React ya escapa HTML, no necesitamos doble escape
    },
    detection: {
      order: ['localStorage', 'navigator'],  // busca idioma primero en localStorage,
      caches: ['localStorage'],              // luego en el idioma del browser
    },                                        // y guarda la elección en localStorage
  })
```

#### Uso en componentes

```typescript
import { useTranslation } from 'react-i18next'

function Navbar() {
  const { t } = useTranslation()

  return (
    <nav>
      <a href="/catalog">{t('nav.catalog')}</a>  {/* "Catalog" o "Catálogo" */}
    </nav>
  )
}
```

`t` es una función que recibe una clave y devuelve el string del idioma activo. Si la clave no existe, devuelve la clave misma (útil para detectar keys faltantes).

#### Cambiar idioma en runtime

```typescript
function LanguageToggle() {
  const { i18n } = useTranslation()
  const isEs = i18n.language.startsWith('es')

  return (
    <button onClick={() => i18n.changeLanguage(isEs ? 'en' : 'es')}>
      {isEs ? 'EN' : 'ES'}
    </button>
  )
}
```

`i18n.changeLanguage()` hace tres cosas:
1. Cambia el idioma activo en memoria
2. Re-renderiza todos los componentes que usan `useTranslation`
3. Guarda el nuevo idioma en `localStorage` (porque configuramos `caches: ['localStorage']`)

#### Plurales en i18next

El badge "N filtros activos" tiene un caso especial: "1 filtro activo" vs "2 filtros activos".

```json
{
  "catalog": {
    "filters": {
      "activeFilter_one": "{{count}} active filter",
      "activeFilter_other": "{{count}} active filters"
    }
  }
}
```

i18next detecta automáticamente cuál usar según el valor de `count`:

```typescript
t('catalog.filters.activeFilter', { count: 1 }) // → "1 active filter"
t('catalog.filters.activeFilter', { count: 3 }) // → "3 active filters"
```

El sufijo `_one` y `_other` son las categorías de plural de CLDR (el estándar internacional de plurales). En español también funcionan: `_one` (1), `_other` (0, 2, 3...).

---

### 6. Cuándo usar defaults en componentes vs cuándo pasarlo como prop

Este sprint tiene un patrón que aparece en `LoadingSpinner`, `ErrorMessage` y `EmptyState`:

```typescript
// ❌ Antes: default hardcodeado en el parámetro
function LoadingSpinner({ label = 'Cargando...' }: Props) {
  return <span>{label}</span>
}

// ✓ Después: default calculado dentro del componente con i18n
function LoadingSpinner({ label }: Props) {
  const { t } = useTranslation()
  const displayLabel = label ?? t('ui.loading')  // null coalescing: usa t() solo si label es undefined

  return <span>{displayLabel}</span>
}
```

**¿Por qué no se puede usar `t()` en el parámetro por defecto?**

Los parámetros por defecto en JavaScript se evalúan en el momento de la llamada, fuera del ciclo de render de React. Los hooks (como `useTranslation`) solo pueden llamarse dentro del cuerpo de un componente. Si los llamás en los parámetros, React tira un error.

**¿Qué es `??` (null coalescing)?**

`a ?? b` devuelve `b` solo si `a` es `null` o `undefined`. Es diferente de `||` que también activa con `0`, `''`, `false`.

```typescript
undefined ?? 'default'  // → 'default'
null ?? 'default'       // → 'default'
'' ?? 'default'         // → ''       ← OJO: string vacío no activa ??
0 ?? 'default'          // → 0        ← OJO: cero no activa ??
false ?? 'default'      // → false    ← OJO: false no activa ??
```

---

### 7. El patrón "titleKey" para componentes con texto dinámico

`PlaceholderPage` recibía `title="Mi Inventario"` — un string hardcodeado que no cambia con el idioma. La solución fue pasar la *clave de traducción* en vez del texto ya traducido:

```typescript
// ❌ Antes: string hardcodeado, no reacciona al cambio de idioma
<PlaceholderPage title="Mi Inventario" sprint="Sprint 4" />

// ✓ Después: clave de traducción, el componente la resuelve
<PlaceholderPage titleKey="router.inventory" sprint="Sprint 4" />

// PlaceholderPage.tsx
function PlaceholderPage({ titleKey, sprint }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2>{t(titleKey)}</h2>   {/* "Mi Inventario" o "My Inventory" según el idioma */}
    </div>
  )
}
```

Este patrón es útil para cualquier componente genérico que recibe texto de afuera: en vez de pasar el texto traducido (que congela el idioma en el momento del render del padre), pasás la clave y el componente se encarga de traducir con el idioma actual.

---

### 8. Vista galería vs lista: el patrón ViewMode

Muchas apps tienen esto: ver productos en grilla o en tabla. La implementación es simple pero hay detalles importantes:

```typescript
// ViewToggle.tsx — solo maneja la UI del switch
export type ViewMode = 'gallery' | 'list'

export function ViewToggle({ view, onViewChange }) {
  return (
    <div role="group" aria-label="View mode">
      <button
        aria-pressed={view === 'gallery'}  // accesibilidad: indica estado activo
        onClick={() => onViewChange('gallery')}
      >⊞</button>
      <button
        aria-pressed={view === 'list'}
        onClick={() => onViewChange('list')}
      >☰</button>
    </div>
  )
}

// CatalogPage.tsx — controla qué view se renderiza
const [view, setView] = useState<ViewMode>('gallery')

{view === 'gallery'
  ? <CardGrid cards={cards} />
  : <CardListView cards={cards} />
}
```

**¿Por qué `useState` para la view y `useSearchParams` para los filtros?**

El modo de vista es una preferencia de sesión, no algo que tenga sentido compartir en una URL. Si alguien te manda un link de "cartas de nivel 7 en vista lista", la lista es irrelevante para ellos — lo importante son los filtros. Entonces:

- **Filtros** → URL (compartible, persistente)
- **Vista galería/lista** → `useState` (efímera, local)

---

### 9. Arquitectura final del módulo catalog

```
features/catalog/
├── types.ts                  ← contratos de datos (Raw API + dominio + filtros)
├── constants.ts              ← listas estáticas (atributos, razas, niveles)
├── api.ts                    ← funciones de fetch (fetchCards, fetchArchetypes)
├── hooks/
│   ├── useCatalogFilters.ts  ← estado de filtros en URL
│   ├── useCards.ts           ← query de cartas con debounce + cancel
│   └── useArchetypes.ts      ← query de arquetipos (caché permanente)
└── components/
    ├── FilterBar             ← HUD de filtros
    ├── SearchBar             ← buscador con debounce visual
    ├── ViewToggle            ← galería/lista
    ├── CardGrid + CardTile   ← vista galería (con tooltip)
    ├── CardListView + CardListItem ← vista lista (con tooltip)
    ├── CardTooltip           ← panel flotante al hover (portal → body)
    └── Pagination            ← paginación con ellipsis
```

El flujo de datos sigue siempre la misma dirección (unidireccional):

```
URL (source of truth para filtros)
  ↓ useSearchParams
useCatalogFilters (lee/escribe URL)
  ↓ filters object
useCards (debounce + query)
  ↓ data
CatalogPage (orquestador)
  ↓ props
FilterBar, CardGrid/CardListView, Pagination (presentadores)
```

Ningún componente presentador conoce la URL ni el fetch. Solo recibe datos y dispara callbacks. Eso hace que sean testeables y reutilizables.

---

### 10. Card Tooltip: portals, hover con delay y posicionamiento inteligente

#### El problema que resuelve

En una grilla de tarjetas pequeñas, la imagen y el nombre se ven bien, pero la descripción del efecto (que puede tener 200 palabras) no cabe. La solución estándar en apps de TCG es un **panel flotante al hover** que muestra toda la información sin cambiar de página.

El desafío técnico está en tres lugares:
1. **El tooltip no puede quedar recortado** por el contenedor de la grilla (que tiene `overflow: hidden`)
2. **No debe parpadear** cuando el cursor pasa rápido entre cartas
3. **No debe salir del viewport** en cartas en los bordes de la pantalla

#### Problema 1: `createPortal` — renderizar fuera del árbol DOM

##### Contexto del problema

En React, cada componente renderiza dentro de su árbol DOM padre. Un tooltip dentro de `CardTile` quedaría dentro del `<article>` de la carta, que a su vez está dentro del `<div>` de la grilla. Si la grilla tiene `overflow: hidden`, el tooltip aparece cortado.

```
<body>
  <div id="root">
    <div class="catalog-grid">        ← overflow: hidden aquí
      <article class="card-tile">
        <div class="tooltip"> ←←← queda cortado por el padre
        </div>
      </article>
    </div>
  </div>
</body>
```

La solución: renderizar el tooltip **directamente en `<body>`**, fuera de toda esa jerarquía.

##### Qué es `createPortal`

`createPortal` es una función de React que permite renderizar JSX en un nodo DOM diferente al del componente padre, **pero manteniéndolo en el árbol de React**. Esto significa que los eventos de React, el contexto y el estado siguen funcionando normalmente.

```typescript
import { createPortal } from 'react-dom'

// Esto renderiza el tooltip en document.body,
// aunque este código esté dentro de CardTile
createPortal(<CardTooltip card={card} />, document.body)
```

Resultado en el DOM real:
```
<body>
  <div id="root">
    <div class="catalog-grid">
      <article class="card-tile">  ← el componente vive aquí en React
      </article>
    </div>
  </div>
  <div class="tooltip">  ←←← pero el DOM aparece aquí, libre de clipping
  </div>
</body>
```

##### Cuándo usar `createPortal`

| Caso de uso | Por qué necesita portal |
|---|---|
| Tooltips | El padre puede tener `overflow: hidden` |
| Modales | Deben estar encima de TODO el contenido |
| Dropdowns complejos | Pueden quedar cortados por contenedores |
| Notificaciones / toasts | Siempre en la esquina de la pantalla |

##### La implementación en CardTile

```typescript
import { createPortal } from 'react-dom'
import { CardTooltip } from './CardTooltip'

export function CardTile({ card }) {
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  return (
    <article>
      {/* contenido normal de la carta */}

      {/* El portal: solo se renderiza cuando anchorRect no es null */}
      {anchorRect && createPortal(
        <CardTooltip card={card} anchorRect={anchorRect} />,
        document.body   // ← nodo DOM destino
      )}
    </article>
  )
}
```

`anchorRect` es el rectángulo de la carta en el viewport (obtenido con `getBoundingClientRect()`). Cuando es `null`, el portal no existe. Cuando el usuario hace hover, se calcula el rect y el portal aparece.

---

#### Problema 2: Hover con delay — `setTimeout` como guardia de parpadeo

##### El problema del parpadeo

Sin delay, si el usuario mueve el cursor de carta a carta rápidamente:

```
onMouseEnter carta A → tooltip aparece
onMouseLeave carta A → tooltip desaparece
onMouseEnter carta B → tooltip aparece
onMouseLeave carta B → tooltip desaparece
...
```

El resultado: la pantalla parpadea con tooltips que aparecen y desaparecen en milisegundos. Horrible.

##### La solución: retrasar el `onMouseEnter`

```typescript
const HOVER_DELAY_MS = 300

const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const articleRef = useRef<HTMLElement>(null)

function handleMouseEnter() {
  // En vez de mostrar inmediatamente, esperamos 300ms
  timerRef.current = setTimeout(() => {
    if (articleRef.current) {
      setAnchorRect(articleRef.current.getBoundingClientRect())
    }
  }, HOVER_DELAY_MS)
}

function handleMouseLeave() {
  // Si el usuario se fue antes de los 300ms, cancelamos el timer
  if (timerRef.current) {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }
  setAnchorRect(null)  // ocultamos el tooltip si estaba visible
}
```

Ahora:
```
onMouseEnter carta A → empieza timer de 300ms
onMouseLeave carta A → cancela el timer (antes de los 300ms)
onMouseEnter carta B → empieza timer de 300ms
... [300ms de silencio] ...
→ tooltip aparece para carta B
```

Sin parpadeo.

##### Por qué `useRef` y no `useState` para el timer

El ID del timer (`timerRef.current`) no es parte del estado visible de la UI. No necesitamos que React re-renderice cuando cambia. `useRef` guarda un valor mutable que persiste entre renders sin causar re-renders.

```typescript
// ❌ INCORRECTO: causa re-renders innecesarios
const [timerId, setTimerId] = useState<number | null>(null)

// ✓ CORRECTO: mutable, persistente, no causa re-renders
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

##### El cleanup en `useEffect`

¿Qué pasa si el componente se desmonta mientras el timer está corriendo (por ejemplo, la carta sale de la pantalla al paginar)?

```typescript
useEffect(() => {
  return () => {
    // Esta función se ejecuta cuando el componente se desmonta
    if (timerRef.current) clearTimeout(timerRef.current)
  }
}, [])
```

Sin esto, el timer seguiría corriendo después de que la carta ya no existe, intentando actualizar el estado de un componente desmontado — React tiraría un warning.

**Regla general:** Si en un `useEffect` creás algo asíncrono (timers, subscripciones, event listeners), siempre limpialo en el `return` del efecto.

---

#### Problema 3: Posicionamiento inteligente con `position: fixed`

##### Por qué `position: fixed` y no `position: absolute`

- `position: absolute`: relativo al ancestro más cercano con `position: relative`. Si la grilla tiene scroll, el tooltip se desplaza con ella y puede quedar fuera del viewport.
- `position: fixed`: relativo al viewport. No importa cuánto hayas scrolleado, el tooltip siempre aparece en la posición correcta de la pantalla.

##### `getBoundingClientRect()` — la clave del posicionamiento

```typescript
const rect = element.getBoundingClientRect()
// rect.top    → distancia del borde superior del elemento al borde superior del viewport
// rect.left   → distancia del borde izquierdo al borde izquierdo del viewport
// rect.right  → distancia del borde derecho al borde izquierdo del viewport
// rect.bottom → distancia del borde inferior al borde superior del viewport
// rect.width  → ancho del elemento
// rect.height → alto del elemento
```

Estas coordenadas son exactamente las que necesita `position: fixed` para posicionar el tooltip.

##### El algoritmo de posicionamiento

```typescript
const TOOLTIP_W = 380   // ancho del tooltip en px
const TOOLTIP_MAX_H = 520
const GAP = 14          // espacio entre carta y tooltip

function getPosition(rect: DOMRect) {
  // ¿Cuánto espacio hay a la derecha de la carta?
  const spaceRight = window.innerWidth - rect.right - GAP

  const left = spaceRight >= TOOLTIP_W
    ? rect.right + GAP          // hay espacio → aparece a la derecha
    : Math.max(8, rect.left - TOOLTIP_W - GAP)  // no hay espacio → a la izquierda

  // Alinear con el borde superior de la carta,
  // pero sin salir del viewport por abajo
  const top = Math.max(
    8,                                            // no subir del borde superior
    Math.min(rect.top, window.innerHeight - TOOLTIP_MAX_H - 8)  // no bajar del borde inferior
  )

  return { left, top }
}
```

Visualización:

```
┌─────────────────────────────────────────────────────────┐
│  viewport                                               │
│                                                         │
│  [Tooltip]  [Carta]     spaceRight >= 380px             │
│                                                         │
│             [Carta]  [Tooltip]   spaceRight < 380px     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

##### `pointer-events: none` — el tooltip invisible para el mouse

```css
.tooltip {
  pointer-events: none;
}
```

Sin esto: el cursor pasa de la carta al tooltip, dispara `onMouseLeave` en la carta, el tooltip desaparece.

Con `pointer-events: none`: el tooltip no intercepta eventos de mouse. El cursor "pasa a través" de él. Desde el punto de vista del browser, el cursor sigue sobre la carta aunque visualmente esté sobre el tooltip.

---

#### La animación de entrada

```css
.tooltip {
  animation: tooltipIn 0.14s ease;
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

Un fade-in con ligero scale y desplazamiento vertical. Duración de 140ms — suficiente para percibirse como suave sin sentirse lento. Los tooltips deben aparecer rápido; una animación de más de 200ms se siente pesada.

---

#### El patrón DRY: centralizar ATTRIBUTE_COLOR en `constants.ts`

Antes del sprint, `ATTRIBUTE_COLOR` estaba duplicado en `CardTile.tsx` y `CardListItem.tsx`. Al crear `CardTooltip` también lo necesitaba — ya serían 3 copias.

```typescript
// constants.ts — fuente única de verdad
export const ATTRIBUTE_COLOR: Record<string, string> = {
  DARK: '#9b59b6',
  LIGHT: '#f1c40f',
  EARTH: '#a67c52',
  WATER: '#3498db',
  FIRE: '#e74c3c',
  WIND: '#2ecc71',
  DIVINE: '#e67e22',
}
```

Ahora los 3 componentes importan de un solo lugar:

```typescript
import { ATTRIBUTE_COLOR } from '../constants'
```

**Regla DRY (Don't Repeat Yourself):** si un mismo dato aparece en 3 o más lugares, ya es hora de centralizarlo. Con 2 copias puedes discutirlo; con 3, es definitivamente un problema de mantenimiento.

---

#### El flujo completo de un hover

```
[Usuario mueve cursor sobre CardTile]
         ↓
  onMouseEnter dispara
         ↓
  setTimeout(300ms) empieza
         ↓
  [¿Usuario se fue antes de 300ms?]
  SÍ → clearTimeout → fin
  NO ↓
         ↓
  getBoundingClientRect() → DOMRect { top, left, right, ... }
         ↓
  setAnchorRect(rect) → React re-renderiza CardTile
         ↓
  createPortal(<CardTooltip anchorRect={rect} />, document.body)
         ↓
  CardTooltip calcula left/top con getPosition(rect)
         ↓
  Tooltip se monta en <body> con position: fixed
         ↓
  CSS animation: fade in 140ms

[Usuario saca el cursor]
         ↓
  onMouseLeave dispara
         ↓
  setAnchorRect(null) → anchorRect === null
         ↓
  createPortal no se ejecuta → portal se desmonta
         ↓
  Tooltip desaparece del DOM
```

---

### 11. Bug fix: posicionamiento del tooltip según el contexto de layout

#### El bug

Al abrir la vista lista y hacer hover sobre una carta, el tooltip aparecía **encima del contenido de la propia fila**, en el extremo izquierdo de la pantalla. No era el lado derecho como el usuario esperaba.

#### Diagnóstico: trazar la matemática del posicionamiento

El algoritmo original calculaba la posición así:

```
spaceRight = window.innerWidth - rect.right - GAP
left = spaceRight >= 380 ? rect.right + GAP : Math.max(8, rect.left - 380 - 14)
```

En vista **galería**, los cards son ~160px de ancho, así que:
```
rect.right ≈ 400px  →  spaceRight ≈ 966px  →  tooltip aparece a la DERECHA ✓
```

En vista **lista**, los items son `width: 100%` (todo el ancho del contenedor), así que:
```
rect.right ≈ 1350px  →  spaceRight = 1366 - 1350 - 14 = 2px  →  cae al fallback
fallback: Math.max(8, rect.left - 380 - 14)
        = Math.max(8, 60 - 394)
        = Math.max(8, -334) = 8px          ← tooltip aparece en x=8, encima del item ✗
```

El tooltip quedaba pegado al borde izquierdo, exactamente donde empieza el contenido de la fila.

#### Por qué ocurre este tipo de bug

Este es un caso clásico de **un algoritmo correcto para un contexto, incorrecto para otro**. El algoritmo de izquierda/derecha fue diseñado pensando en cards pequeños (galería), donde siempre hay espacio libre en alguno de los dos lados. En lista, el item es tan ancho que no hay espacio en ninguno de los dos lados → el fallback da un resultado inútil.

La solución no es "arreglar" el algoritmo para que funcione en ambos casos con más lógica. Es **darle al componente información sobre el contexto** para que use la estrategia correcta.

#### La solución: prop `preferRight`

```typescript
interface Props {
  card: Card
  anchorRect: DOMRect
  preferRight?: boolean  // nuevo: cambia la estrategia de posicionamiento
}

function getPosition(rect: DOMRect, preferRight: boolean): { left: number; top: number } {
  let left: number

  if (preferRight) {
    // Lista: items son full-width → no hay espacio lateral.
    // Anclar el tooltip al borde derecho del viewport.
    left = window.innerWidth - TOOLTIP_W - 8
    //     ─────────────────   ─────────   ─
    //     ancho del viewport  ancho del   margen
    //                         tooltip
  } else {
    // Galería: lógica original (derecha del card → izquierda si no cabe)
    const spaceRight = window.innerWidth - rect.right - GAP
    left = spaceRight >= TOOLTIP_W
      ? rect.right + GAP
      : Math.max(8, rect.left - TOOLTIP_W - GAP)
  }

  const top = Math.max(8, Math.min(rect.top, window.innerHeight - TOOLTIP_MAX_H - 8))
  return { left, top }
}
```

Y en `CardListItem.tsx`, pasamos el prop:

```tsx
{anchorRect &&
  createPortal(
    <CardTooltip card={card} anchorRect={anchorRect} preferRight />,
    //                                               ^^^^^^^^^^^
    //                                               activa la estrategia lista
    document.body
  )}
```

En `CardTile.tsx` no cambiamos nada — el tooltip de galería sigue usando la lógica original.

#### Resultado visual comparado

```
ANTES (lista):
┌────────────────────────────────────────────────────┐ viewport
│[Tooltip x=8 ←────────────]  [resto del item ────] │
│ Overlapping el item, a la izquierda                │
└────────────────────────────────────────────────────┘

DESPUÉS (lista):
┌────────────────────────────────────────────────────┐ viewport
│[   item content ──────────]        [Tooltip x=978] │
│ Item visible. Tooltip a la derecha, sin overlap.   │
└────────────────────────────────────────────────────┘
```

#### La lección: pasar contexto, no hackear algoritmos

La tentación al ver este bug era agregar más condiciones al algoritmo existente:

```typescript
// ❌ Solución hackish: más condiciones en getPosition
if (rect.width > window.innerWidth * 0.8) {
  // probablemente es un item de lista...
  left = window.innerWidth - TOOLTIP_W - 8
}
```

Esto funciona, pero es frágil: depende de asumir un ratio de ancho para detectar el modo, y falla si el layout cambia. Es lo que se llama **"detección de contexto por inferencia"** — intentar adivinar el contexto a partir de datos indirectos.

La solución correcta es **hacer el contexto explícito**. El componente padre (`CardTile` vs `CardListItem`) ya sabe en qué modo está. Le dice al tooltip directamente con `preferRight`. El tooltip no necesita adivinar nada.

```
CardListItem (sabe que está en lista)
    → preferRight={true} → tooltip siempre a la derecha

CardTile (sabe que está en galería)
    → preferRight={false} (por defecto) → tooltip usa lógica auto
```

Este patrón aparece constantemente en interfaces complejas: **los datos de contexto fluyen hacia abajo por props**, y cada nivel solo se ocupa de lo que le corresponde. No hay magia implícita.

---

## Próximo: Sprint 4 — Inventario por usuario

En el siguiente sprint vamos a agregar persistencia real:

- El usuario podrá hacer click en "Agregar a inventario" desde cualquier carta del catálogo.
- Vista "Mi Inventario" con sus cartas y cantidades.
- Edición de cantidades y metadatos (condición, edición).
- El estado del inventario vivirá en Zustand (que ya está instalado desde Sprint 1 esperando este momento).
